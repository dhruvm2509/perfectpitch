"use client";
import React, { ChangeEvent, useState } from 'react';
import { storage } from '../../../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './FileUpload.css'; // Use an external stylesheet for better maintainability

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([
    // Top 10 suggestions for a good resume
    'Customize your resume for the job you are applying for',
    'Use a clear, professional font',
    // Add more suggestions here
  ]);
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };
  function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
  const onUpload = async () => {
    if (file) {
      const storageRef = ref(storage, `resumes/${file.name}`);
      await uploadBytes(storageRef, file).then(() => {
        getDownloadURL(storageRef)
          .then(async (url) => {
            setFileUrl(url);
            await delay(500);
            alert('Resume uploaded successfully!');
            setAtsScore(57); // Example score
            setWeaknesses([
              'Insufficient use of industry-related keywords',
              'Inconsistent work history presentation',
              'Limited evidence of leadership experience',
            ]);
          })
          .catch((error) => {
            console.error("Error fetching file URL:", error);
            alert('Failed to get file URL.');
          });
      });
    }
  };

  return (
    <div className="file-upload-container">
      <div className="resume-upload-section">
        {!fileUrl && (
          <div className="upload-controls">
            <input type="file" onChange={onFileChange} className="file-input" />
            <button onClick={onUpload} className="upload-button">Upload Resume</button>
          </div>
        )}
        {fileUrl && (
          <div className="uploaded-resume">
            <h2>Uploaded Resume</h2>
            <iframe src={fileUrl} className="resume-iframe" title="Resume"></iframe>
          </div>
        )}
      </div>
      <div className="ats-score-section">
        <h2>ATS Score</h2>
        <div className="score">{atsScore ? `${atsScore}%` : 'No score available'}</div>
        <h3>Weaknesses in Resume</h3>
        <ul className="weaknesses-list">
          {weaknesses.map((weakness, index) => (
            <li key={index}>{weakness}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FileUpload;
