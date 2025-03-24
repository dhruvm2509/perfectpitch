"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Datepicker from "react-tailwindcss-datepicker";
import { addEvent } from "../../../../firebase/firestore";
import { useAuth } from "../../../../firebase/auth";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { askForQuestions } from "../../../../firebase/firebaseLLM";
import { addQuestion } from "../../../../firebase/firestore";
import { extractQuestions, extractScoreAndAnalysis } from "@/utils/extractNumber";

const ERROR_MESSAGE = "Error processing data.";

export default function Page() {
	const [eventDate, setEventDate] = useState({
		startDate: null,
		endDate: null,
	});
	const { authUser } = useAuth();
	const router = useRouter();

	const handleDateChange = (newValue: any) => {
		setEventDate(newValue);
	};


	//Hack Creating an event
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formRef = e.currentTarget as HTMLFormElement;
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get("title") as string;
		const type = formData.get("type") as string;
		//Hack Adding job description
		const description = formData.get("description") as string;
		const company = formData.get("company") as string;
		const role = formData.get("role") as string;
		const audience = formData.get("audience") as string;

		if (!type || !company || !role || !description || !audience || !eventDate.startDate || !title) {
			toast.error("All fields are required");
			return;
		}

		const date = new Date(eventDate.startDate);
		const timestamp = Timestamp.fromDate(date);

		if (!authUser) {
			toast.error("You must be logged in to create an event");
			router.push("/sign-in");
			return;
		}


		let LLMresponse = "not updated"
		const prompt = `Prepare me for an interview by giving me the most optimum 10 questions with number that could be asked based on the job description: ${description} and job role: ${role} at Company: ${company}. Return response as a string of questions in the format ["question 1", "question 2", "question 3", "question 4", "question 5", "question 6", "question 7", "question 8", "question 9", "question 10" ]`;
		try {
			//Get the questions for the description
			const eventDocId = await addEvent(authUser?.uid, timestamp, type, title, company, role, description, audience);
			try {
				LLMresponse = await askForQuestions(eventDocId, prompt);
			} catch (error) {
				handleError();
				return;
			}
			console.log(LLMresponse)
			const questions = extractQuestions(LLMresponse);
			// const questions = [
			// 	"Experience and skills in extracting and manipulating large datasets using tools like Spark SQL and scripting languages.",
			// 	"Understanding of predictive modeling algorithms for supervised and unsupervised learning, including classification, regression, and clustering.",
			// 	"Familiarity with deep learning algorithms, such as CNN/RNN/LSTM/Transformer, and deep learning frameworks like TensorFlow or PyTorch.",
			// 	"Examples of problems solved independently, highlighting teamwork and communication abilities.",
			// 	"Experience in translating business questions into machine learning problems and developing innovative solutions.",
			// 	"Process for implementing state-of-the-art machine learning models to improve business metrics.",
			// 	"Understanding of causal inference models and their application in work.",
			// 	"Experiences with Large Language Models and Generative AI.",
			// 	"Approach to developing infrastructure tools to improve the development and deployment of machine learning models.",
			// 	"Alignment of personal values with the mission and culture of Apple, as described in the job description."
			// ]

			console.log("Questions: ", questions);

			try {
				// addQuestion(
				// 	authUser?.uid,
				// 	eventDocId,
				// 	questions
				// );
				for (const question of questions) {
					try {
					  await addQuestion(authUser?.uid, eventDocId, question);
					  console.log('Question added successfully:', question);
					} catch (error) {
					  console.error('Error adding question:', question, error);
					  // Optionally break the loop if a single add fails
					  // break;
					}
				  }
			} catch (error) {
				handleError();
				return;
			}
			toast.success("Event created successfully");
		} catch (error) {
			toast.error("Error creating event");
		}

		setEventDate({ startDate: null, endDate: null });

		if (formRef) {
			formRef.reset();
		}
	}

	const [isLoading, setIsLoading] = useState(true);

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

	return (
		<div className="text-neutral-200 p-12">
			<h1 className="text-3xl font-semibold text-neutral-100">Create Event</h1>
			<form onSubmit={handleSubmit}>
				<div className="space-y-12">
					<div className="">
						<div className="mt-10 flex flex-col gap-6">
							<div className="max-w-3xl">
								<label
									htmlFor="title"
									className="block text-sm font-medium leading-6 text-neutral-400"
								>
									Event Title
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<input
										type="text"
										name="title"
										id="title"
										className="block w-full rounded-md py-1.5 px-3 bg-inputBG border border-inputBorder   placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors"
										placeholder="Interview with Company X"
										required
									/>
								</div>
							</div>

							<div className="max-w-3xl">
								<label
									htmlFor="date"
									className="block text-sm font-medium leading-6 text-neutral-400"
								>
									Event Date
								</label>
								<div className="mt-2 max-w-3xl">
									<Datepicker
										asSingle={true}
										inputClassName="bg-inputBG w-full max-w-3xl rounded-md py-1.5 px-3 border border-inputBorder placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors text-neutral-100"
										value={eventDate}
										onChange={handleDateChange}
										popoverDirection="down"
									/>
								</div>
							</div>

							<div className="max-w-3xl">
								<label
									htmlFor="type"
									className="block text-sm font-medium leading-6 text-neutral-400"
								>
									Event Type
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<input
										type="text"
										name="type"
										id="type"
										className="block w-full rounded-md py-1.5 px-3 bg-inputBG border border-inputBorder   placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors"
										placeholder="Interview"
										required
									/>
								</div>
							</div>

							<div className="max-w-3xl">
								<label
									htmlFor="company"
									className="block text-sm font-medium leading-6 text-neutral-400"
								>
									Company
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<input
										type="text"
										name="company"
										id="company"
										className="block w-full rounded-md py-1.5 px-3 bg-inputBG border border-inputBorder   placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors"
										placeholder="Google"
										required
									/>
								</div>
							</div>

							<div className="max-w-3xl">
								<label
									htmlFor="role"
									className="block text-sm font-medium leading-6 text-neutral-400"
								>
									Role
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<input
										type="text"
										name="role"
										id="role"
										className="block w-full rounded-md py-1.5 px-3 bg-inputBG border border-inputBorder   placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors"
										placeholder="Software Engineer"
										required
									/>
								</div>
							</div>

							<div className="max-w-3xl">
								<label
									htmlFor="audience"
									className="block text-sm font-medium leading-6 text-neutral-400"
								>
									Audience
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<input
										type="text"
										name="audience"
										id="audience"
										className="block w-full rounded-md py-1.5 px-3 bg-inputBG border border-inputBorder   placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors"
										placeholder="Recruiter"
										required
									/>
								</div>
							</div>

							<div className="max-w-3xl">
								<label
									htmlFor="description"
									className="block text-bg font-medium leading-6 text-neutral-400"
								>
									Job Description
								</label>
								<div className="relative mt-2 rounded-md shadow-sm">
									<textarea
										name="description"
										id="description"
										rows={5}
										className="block w-full rounded-md py-1.5 px-3 bg-inputBG border border-inputBorder   placeholder:text-gray-400 focus:ring-1 focus:outline-none focus:ring-inputHover sm:text-sm sm:leading-6 transition-colors"
										placeholder="Write your job description here"
										required
									></textarea>
								</div>
							</div>


						</div>
					</div>
				</div>

				<div className="mt-8 flex items-center justify-end max-w-3xl">
					<button
						type="submit"
						className="py-2 px-4 flex rounded-md no-underline bg-mainButton hover:bg-mainButtonHover text-sm font-medium"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	);
}
