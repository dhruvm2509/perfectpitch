import { Timestamp } from "firebase/firestore";

export type Event = {
	uid: string;
	subcollectionId?: string;
	eventDate: Timestamp;
	eventType: string;
	title: string;
	role: string;
	description: string;
	company: string;
	audience: string;
};

export type QuestionData = {
	uid: string;
	eventDocId: string;
	question:string;
	docId:string;
}

export type RecordingData = {
	uid: string;
	eventDocId: string;
	dateCreated: Timestamp;
	question: string,
	questionDocId: string,
	fileBucket: string;
	transcript: string;
	score: number;
	analysis: string;
	subcollectionId?: string;
	audioSrc: any;
};
