import { db } from "./firebase";
import {
	addDoc,
	setDoc,
	doc,
	documentId,
	collection,
	getDocs,
	orderBy,
	query,
	Timestamp,
	where,
	onSnapshot,
} from "firebase/firestore";
import type { Event, QuestionData, RecordingData } from "../types/event";
import { Dispatch, SetStateAction } from "react";
import { getStorageDownloadURL } from "./storage";
import exp from "constants";

const EVENTS_COLLECTION = "events";
const RECORDINGS_COLLECTION = "recordings";

export async function addEvent(
	uid: string,
	eventDate: Timestamp,
	eventType: string,
	title: string,
	company: string,
	role: string,
	description: string,
	audience: string
) {
	const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
		uid,
		eventDate,
		eventType,
		title,
		company,
		role,
		description,
		audience
	});
	return docRef.id;
}

export async function getEvent(uid: string, docId: string) {
	const eventQuery = query(
		collection(db, EVENTS_COLLECTION),
		where("uid", "==", uid),
		where(documentId(), "==", docId)
	);

	const eventSnapshot = await getDocs(eventQuery);

	const event: Event[] = [];
	for (const docSnapshot of eventSnapshot.docs) {
		event.push(docSnapshot.data() as Event);
	}

	return event;
}

export function updateEvent(
	docId: string,
	uid: string,
	eventDate: Timestamp,
	eventType: string,
	title: string,
	company: string,
	role: string,
	description: string,
	audience: string,
) {
	setDoc(doc(db, EVENTS_COLLECTION, docId), {
		uid,
		eventDate,
		eventType,
		title,
		company,
		role,
		description,
		audience,
	});
}

export async function getEvents(
	uid: string,
	setEvents: Dispatch<SetStateAction<Event[]>>,
	setIsLoading: Dispatch<SetStateAction<boolean>>
) {
	const eventsQuery = query(
		collection(db, EVENTS_COLLECTION),
		where("uid", "==", uid),
		orderBy("eventDate", "desc")
	);

	const unsubscribe = onSnapshot(eventsQuery, async (snapshot) => {
		let allEvents = [];

		for (const docSnapshot of snapshot.docs) {
			allEvents.push({
				...docSnapshot.data(),
				subcollectionId: docSnapshot.id,
			});
		}

		setEvents(allEvents as Event[]);
		setIsLoading(false);
	});

	return unsubscribe;
}

export async function getRecordings(
	uid: string,
	eventDocId: string,
	setData: Dispatch<SetStateAction<RecordingData[]>>,
	setIsLoading: Dispatch<SetStateAction<boolean>>
) {
	const recordingsQuery = query(
		collection(db, RECORDINGS_COLLECTION),
		where("uid", "==", uid),
		where("eventDocId", "==", eventDocId),
		orderBy("dateCreated", "desc")
	);
  
	const unsubscribe = onSnapshot(recordingsQuery, async (snapshot) => {
		let allRecordings = [];

		for (const docSnapshot of snapshot.docs) {
			const data = docSnapshot.data();
			allRecordings.push({
				...data,
				subcollectionId: docSnapshot.id,
				audioSrc: await getStorageDownloadURL(data["fileBucket"]),
			});
	}
  
		setData(allRecordings as RecordingData[]);
		setIsLoading(false);
	});

	return unsubscribe;
  }


export async function getResumes(uid: string) {
	const resumeQuery = query(
		collection(db, "resumes"),
		where("uid", "==", uid)
	);

	const resumeSnapshot = await getDocs(resumeQuery);

	const resumes: string[] = [];
	resumeSnapshot.forEach((docSnapshot) => {
		resumes.push(docSnapshot.data().resume);
	});

	return resumes;
}

export async function getRecording(uid: string, recordingDocId: string) {
	const recordingQuery = query(
		collection(db, RECORDINGS_COLLECTION),
		where("uid", "==", uid),
		where(documentId(), "==", recordingDocId)
	);

	const querySnapshot = await getDocs(recordingQuery);
	let recording = [];

	for (const docSnapshot of querySnapshot.docs) {
		const data = docSnapshot.data();
		recording.push({
			...data,
			audioSrc: await getStorageDownloadURL(data["fileBucket"]),
		} as RecordingData);
	}

	return recording;
}

export function addRecordingData(
	uid: string,
	question: string,
	questionDocId: string,
	eventDocId: string,
	dateCreated: Timestamp,
	transcript: string,
	score: number,
	analysis: string,
	fileBucket: string
) {
	addDoc(collection(db, RECORDINGS_COLLECTION), {
		uid,
		question,
		questionDocId,
		eventDocId,
		dateCreated,
		fileBucket,
		transcript,
		score,
		analysis,
	});
}


const QUESTIONS_COLLECTION = "questions"

export function addQuestion(
	uid: string,
	eventDocId: string,
	question: string,
) {
	addDoc(collection(db, QUESTIONS_COLLECTION), {
		uid,
		eventDocId,
		question
	});
}

export async function getQuestions(uid: string, eventID: string) {
	const questionsQuery = query(
	  collection(db, QUESTIONS_COLLECTION),
	  where("eventDocId", "==", eventID)
	);
  
	const questionSnapshot = await getDocs(questionsQuery);

  const questions: (QuestionData & { docId: string })[] = []; // Adjusting the type to include docId
  for (const docSnapshot of questionSnapshot.docs) {
    const questionData = docSnapshot.data() as QuestionData;
    questions.push({
      ...questionData, // Spread the existing document data
      docId: docSnapshot.id // Include the document ID
    });
  }

  console.log(questions);
  return questions;
}


// create a function which will add a resume to the database 
export function addResume(
	uid: string,
	resume: string,
) {
	addDoc(collection(db, "resumes"), {
		uid,
		resume,
	});
}