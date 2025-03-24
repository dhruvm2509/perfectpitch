import { Timestamp } from "assemblyai";
import { db } from "./firebase";
import {
	addDoc,
	collection,
	documentId,
	query,
	where,
	orderBy,
	onSnapshot,
	limit,
	doc,
	setDoc,
} from "firebase/firestore";
import { Dispatch, SetStateAction } from "react";

const DISCUSSIONS_COLLECTION = "discussions";

export type LLMMessage = {
	createTime: Timestamp;
	prompt: string;
	response: string;
	uid: string;
	status: {
		completeTime: Timestamp;
		startTime: Timestamp;
		state: string;
		updateTime: Timestamp;
	};
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI('AIzaSyAbkeHEEgISOoe108kpXq4ah90EszpAAIA');

export async function askForAnalyzation(uid: string, prompt: string) {
	let response = '';	
	  try {
		// Instantiate the model with the desired configuration
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });
	
		// Call the API with the provided prompt
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text(); // Assuming response.text() is the correct way to retrieve the text

		console.log(text)
	
		console.log("Response from Google Gemini: ", text);
		return text;
	  } catch (error) {
		console.error("Error processing the Google Gemini API request:", error);
		throw error;
	  }
}

const QUESTIONS_COLLECTION = "questions";

export async function askForQuestions(uid: string, prompt: string) {	
	  try {
		// Instantiate the model with the desired configuration
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });
	
		// Call the API with the provided prompt
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text(); // Assuming response.text() is the correct way to retrieve the text
		return text;
	  } catch (error) {
		console.error("Error processing the Google Gemini API request:", error);
		throw error;
	  }
}

export async function addMessage(uid: string, prompt: string) {
	await addDoc(collection(db, DISCUSSIONS_COLLECTION), {
		uid,
		prompt,
	});
}

export async function createMessage() {
	await setDoc(doc(db, "discussions", "chat"), {
		prompt: "Hello!",
	});
}

export function createConversation(
	setConversation: Dispatch<SetStateAction<LLMMessage[]>>
) {
	const unsubscribe = onSnapshot(doc(db, "discussions", "chat"), (snapshot) => {
		setConversation((prev) => [...prev, snapshot.data() as LLMMessage]);
	});

	return unsubscribe;
}
