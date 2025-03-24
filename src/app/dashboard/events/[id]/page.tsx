"use client";

import { useEffect, useState } from "react";
import { SidePanel } from "@/components/sidePanel/SidePanel";
import { MicrophoneIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/20/solid";
import { uploadFile } from "../../../../../firebase/storage";
import { getQuestions, getRecordings } from "../../../../../firebase/firestore";
import { addRecordingData } from "../../../../../firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../firebase/auth";
import { Timestamp, doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { QuestionData, type RecordingData } from "../../../../../types/event";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { AssemblyAI } from "assemblyai";
import { getEvent } from "../../../../../firebase/firestore";
import { askForAnalyzation } from "../../../../../firebase/firebaseLLM";
import type { Event } from "../../../../../types/event";
import { extractScoreAndAnalysis } from "@/utils/extractNumber";
import { getColor } from "@/utils/getScoreColor";

const ERROR_MESSAGE = "Error processing data.";

const assemblyai = new AssemblyAI({
	apiKey:  "f48823fff0284097a948e1801e84e1ef",
});

export default function Page(params: { id: string }) {
	const [open, setOpen] = useState(false);
	const [currEvent, setCurrEvent] = useState<Event>();
	const [currQuestions, setCurrQuestions] = useState<QuestionData[]>([]);
	const [data, setData] = useState<RecordingData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { authUser } = useAuth();
	const { id: eventId } = useParams();

	const [currentQuestion, setCurrentQuestion] = useState<String>();
	const [currentQuestionDocId, setCurrentQuestionDocId] = useState<string> ();

	function togglePanel(item:string, index:string) {
		setCurrentQuestion(item);
		setCurrentQuestionDocId(index);
		setOpen((prev) => !prev);
	}

	useEffect(() => {
		const fetchData = async () => {
			if (authUser) {
				const unsubscribe = await getRecordings(
					authUser?.uid!,
					eventId as string,
					setData,
					setIsLoading
				);
		
				setIsLoading(false);

				return () => {
					unsubscribe();
				};
			}
		};

		fetchData();
	}, [authUser, eventId]);

	useEffect(()=>{
		console.log("recordings:", data);
	},data)

	useEffect(() => {
		const fetchEventData = async () => {
			if (authUser) {
				const eventData = await getEvent(authUser?.uid!, eventId as string);
				setCurrEvent(eventData[0]);
			}
		};

		fetchEventData();

		const fetchQuestions = async () => {
			if(authUser) {
				const questionsData = await getQuestions(authUser?.uid!, eventId as string);
				console.log("Retrieved questions data:", questionsData);
				const questionsList = questionsData;
				setCurrQuestions(questionsList);
			}
		}

		fetchQuestions();

		
	}, [authUser, eventId]);

	function handleError() {
		setIsLoading(false);
		toast.update("uploadRecording", {
			render: ERROR_MESSAGE,
			type: "error",
			isLoading: false,
			autoClose: 3000,
			draggable: true,
			closeOnClick: true,
		});
	}

	function sortQuestions(questions:any) {
		try {
			return questions.sort((a:any, b:any) => {
				const numA = parseInt(a.question.match(/^\d+/)[0], 10); // Extract and parse the number from question A
				const numB = parseInt(b.question.match(/^\d+/)[0], 10); // Extract and parse the number from question B
				return numA - numB;
			  });
		} catch (error) {
			return(questions);
		}
	  }

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		//HACK
		//LOADING SET TRUE
		setIsLoading(true);
		toast.loading("Processing recording ...", {
			type: "info",
			toastId: "uploadRecording",
		});

		const formRef = e.currentTarget as HTMLFormElement;
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const question = currentQuestion as string;
		const questionDocId = currentQuestionDocId as string;
		const eventDocId = eventId as string;
		const file = formData.get("audio-file") as File;

		if ( !file) {
			toast.error("All fields are required");
			return;
		}

		if (!authUser) {
			toast.error("You must be logged in to create an event");
			return;
		}

		let bucket = "";
		let transcript = "";

		try {
			const { text } = await assemblyai.transcripts.transcribe({
				audio: file,
			});

			console.log("Transciption of the audio file: ", text);

			if (!text) {
				handleError();
				return;
			}

			transcript = text;
		} catch (error) {
			setIsLoading(false);
			return;
		}

		try {
			const uploadedBucket = await uploadFile(file, authUser?.uid);
			bucket = uploadedBucket;
		} catch (error) {
			handleError();
			return;
		}

		const prompt = `You are an ${currEvent?.eventType.toLowerCase()} assistant. I want you to help me prepare for an upcoming ${currEvent?.eventType.toLowerCase()} event with ${
			currEvent?.company} and asking the quesiton " ${currentQuestion}
			. I need you to be as honest and subjective as possible to help me. I want you to rate this content I have prepared from 0 to 100 based on performance, clarity, passion and persuasiveness. The content is below. Return the number value as format Score: . The explanation why the score was given and how to improve, I want one paragraph max five sentences with no new lines and returned as plain text as Analysis: . \n
		Answer by the candidate: ${transcript}
		`;

		let LLMresponse = "";


		//Making request to LLM for analysis

		try {
			LLMresponse = (await askForAnalyzation(authUser?.uid!, prompt)) as string;
			console.log("In events window:", LLMresponse);
		} catch (error) {
			handleError();
			return;
		}

		// const score = extractNumber(LLMresponse as string);
		const { score, analysis } = extractScoreAndAnalysis(LLMresponse as string);

		console.log("Score and Analysis:", score, analysis);

		try {
			addRecordingData(
				authUser?.uid,
				question,
				questionDocId,
				eventDocId,
				Timestamp.now(),
				transcript,
				score,
				analysis,
				bucket
			);
		} catch (error) {
			handleError();
			return;
		}

		setIsLoading(false);

		toast.update("uploadRecording", {
			render: "Recording uploaded successfully.",
			type: "success",
			isLoading: false,
			autoClose: 3000,
			draggable: true,
			closeOnClick: true,
		});

		if (formRef) {
			formRef.reset();
		}
	}

	return (
		<div className="text-neutral-200 p-12">
			<div className="flex items-center justify-between mb-8 border-b border-b-border pb-4">
				<div className="">
					<h1 className="text-3xl font-semibold text-neutral-100 mb-2">
						{currEvent?.title}
					</h1>

					<p className="font-medium text-neutral-300">
						<b>Role:</b> {currEvent?.role}
					</p>
					<p className="font-medium text-neutral-300">
						Scheduled on {currEvent?.eventDate.toDate().toLocaleDateString()}
					</p>
				</div>

			</div>

			<div className="flex flex-col gap-4">
				{sortQuestions(currQuestions).map((item:any, index:any) => (
					<div className="bg-dark-background text-white p-4 rounded-lg shadow-lg flex justify-between items-center">
					<h3 className="text-sm font-semibold">{item.question}</h3>
					<div className="flex items-center space-x-4"> {/* Container for buttons */}
					  {(() => {
						const rec = data.find(rec => rec.questionDocId === item.docId);
						return rec ? (
							<Link
							href={`/dashboard/events/${eventId}/${rec.subcollectionId}`}
							key={index}
							className="flex items-center py-2 px-4 rounded-md bg-green-500 hover:bg-green-600 text-sm font-medium transition-colors"
						  >
							See results {">"}
						  </Link>
						) : (
						  <p></p> // Or another placeholder if needed
						);
					  })()}
					  <button
						onClick={() => togglePanel(item.question, item.docId)}
						className="flex items-center py-2 px-4 rounded-md bg-indigo-500 hover:bg-indigo-600 text-sm font-medium transition-colors"
					  >
						<PlusIcon className="w-5 h-5 mr-1" />
						Add Recording
					  </button>
					</div>
				  </div>
					
				))}
				</div>

			{/* THIS IS THE SIDE PANEL WHERE WE UPLOAD THE RECORDING */}
			<SidePanel open={open} setOpen={setOpen}>
				<h1 className="text-3xl font-semibold text-neutral-100 mb-8">
					Upload Recording
				</h1>

				<form onSubmit={handleSubmit}>
					<div className="flex flex-col gap-7">
						<div className="max-w-3xl">
							<label
								htmlFor="title"
								className="block text-sm font-medium leading-6 text-neutral-300"
							>
								Question
							</label>
							<h3 className="text-sm font-semibold">{currentQuestion}</h3>
							
						</div>

						<div className="max-w-3xl">
							<label
								htmlFor=""
								className="block text-sm font-medium leading-6 text-neutral-300"
							>
								Audio File
							</label>
							<div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-500 px-6 py-10">
								<div className="text-center">
									<MicrophoneIcon
										className="mx-auto h-8 w-8 text-gray-300"
										aria-hidden="true"
									/>
									<div className="mt-4 mb-2 flex items-center justify-center text-sm leading-6 text-gray-600">
										<label
											htmlFor="audio-file"
											className="relative cursor-pointer rounded-md bg-inputBG px-6 py-5 font-semibold text-secondaryText "
										>
											<span className="">Upload a file</span>
											<input
												type="file"
												name="audio-file"
												id="audio-file"
												accept="audio/*"
												className="mt-2 cursor-pointer block w-full text-sm text-secondaryText
												file:mr-4 file:py-2 file:px-4
												file:rounded-md file:border-0
												file:text-sm file:font-semibold
												file:bg-inputBorder file:text-neutral-200
												file:cursor-pointer "
											/>
										</label>
									</div>
									<p className="text-xs leading-5 text-gray-400">
										PNG, JPG, GIF up to 10MB
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-8 flex items-center justify-end max-w-3xl">
						<button
							type="submit"
							className="py-2 px-4 flex rounded-md no-underline disabled:bg-gray-700 disabled:bg-opacity-25 disabled:cursor-not-allowed bg-mainButton hover:bg-mainButtonHover text-sm font-medium"
						>
							Save
						</button>
					</div>
				</form>
			</SidePanel>
		</div>
	);
}
