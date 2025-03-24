// import { db } from "./firebase";
// import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
// import type { ResumeData } from "./src/app/dashboard/ResumeChecker/";

// const RESUMES_COLLECTION = "resumes";

// export async function addResume(uid: string, resumeUrl: string) {
//   await addDoc(collection(db, RESUMES_COLLECTION), {
//     uid,
//     resumeUrl,
//   });
// }

// export async function getResumes(uid: string) {
//   const resumeQuery = query(
//     collection(db, RESUMES_COLLECTION),
//     where("uid", "==", uid)
//   );

//   const resumeSnapshot = await getDocs(resumeQuery);

//   const resumes: ResumeData[] = [];
//   resumeSnapshot.forEach((docSnapshot) => {
//     resumes.push(docSnapshot.data() as ResumeData);
//   });

//   return resumes;
// }
