"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { useParams } from "next/navigation";
import { RecordingData } from "../../../../../../types/event";
import { getRecording } from "../../../../../../firebase/firestore";
import { useAuth } from "../../../../../../firebase/auth";
import { getColor } from "@/utils/getScoreColor";
import { createConversation } from "../../../../../../firebase/firebaseLLM";
import { LLMMessage } from "../../../../../../firebase/firebaseLLM";
import Chatbot from "@/components/chatbot/Chatbot";
import { SpeakerWaveIcon } from "@heroicons/react/20/solid";


export default function Page(params: any) {
	const { id, rec_id } = useParams();
	const { authUser } = useAuth();
	const [currRecording, setCurrRecording] = useState<RecordingData>(
		{} as RecordingData
	);
	const [isLoading, setIsLoading] = useState(true);
	const [conversation, setConversation] = useState<LLMMessage[]>([]);
	const [userInput, setUserInput] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			if (authUser) {
				const [recording] = await getRecording(authUser?.uid, rec_id as string);
				setCurrRecording(recording);
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	console.log(currRecording);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="flex p-12 min-h-custom gap-16">
			<div className="w-1/2">
				<div className="flex items-center justify-between mb-8 border-b border-b-border pb-4">
					<div className="w-full">
						<p className="text-2xl font-semibold text-neutral-100 mb-2">
							{currRecording?.question}
						</p>

						<p className="font-medium text-neutral-300">
							Created on{" "}
							{currRecording?.dateCreated.toDate().toLocaleDateString()}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-8">
					<div className="">
						<p className="font-semibold text-xl mb-2">Score</p>
						<div className="rounded-md border border-border p-4 flex justify-center items-center mb-4">
							<p
								className={`text-4xl font-medium mr-2 ${getColor(
									currRecording.score
								)}`}
							>
								{currRecording.score}
							</p>
							<p className="text-4xl font-medium">/ 100</p>
						</div>
					</div>

					<div className="">
						<figure>
							<figcaption className="font-medium text-neutral-200 mb-2">
								Playback recording
							</figcaption>
							<audio controls src={currRecording.audioSrc}></audio>
						</figure>
					</div>
				</div>
			</div>

			<div className="flex flex-col w-1/2 ">
				<div className="mb-10">
					<h2 className="text-xl font-semibold mb-4">Transcript</h2>
					<div className="border rounded-md border-border bg-chatBG p-4">
						<p className="">{currRecording.transcript}</p>
					</div>
				</div>

				<div className="">
					<div className="flex items-center text-xl font-semibold mb-4">
						<SpeakerWaveIcon className="h-6 w-6 mr-2 text-secondaryText" />
						<p className="">PerfectPitch Analysis of Transcript</p>
					</div>
					<div className="border rounded-md border-border bg-chatBG p-4">
						<p className="">{currRecording.analysis}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
