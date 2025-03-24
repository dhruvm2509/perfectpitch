"use client";
// ... other imports
import React from 'react';
import { useAuth } from "../../../firebase/auth";
import 'react-calendar/dist/Calendar.css';

// ... AnimatedBook component and other imports or setups

const FeatureItem: React.FC<{ title: string; description: string, index: number }> = ({ title, description, index }) => {
  // Typewriter effect styles
  const typewriterStyle = `
    .typewriter h3 {
      color: cornflowerblue;
      font-family: monospace;
      overflow: hidden;
      border-right: 0.15em solid orange;
      white-space: nowrap;
      margin: 0 auto;
      letter-spacing: 0.15em;
      animation: typing-${index} 2.5s steps(40, end),
        blink-caret-${index} 0.75s step-end infinite;
    }

    @keyframes typing-${index} {
      from { width: 0 }
      to { width: 100% }
    }

    @keyframes blink-caret-${index} {
      from, to { border-color: transparent }
    }
  `;

  return (
    <>
      <style>{typewriterStyle}</style>
      <div className="ml-4 flex-grow typewriter">
        <h3 className="text-xl font-semibold text-secondaryText mb-3">{title}</h3>
        <p className="text-md text-white mb-5">{description}</p>
      </div>
    </>
  );
};

const FeaturesComponent: React.FC = () => {
  const featureItems = [
    { title: "Tailored Questions", description: "Directly relevant questions based on your job role, company, and description." },
    { title: "Voice Practice", description: "Improve your delivery with voice-recording sessions, mimicking real interviews." },
    { title: "Speech Analysis", description: "Our speech-to-text feature transcribes your answers for thorough review." },
    { title: "LLM Scoring", description: "Get scored on relevancy and clarity with Large Language Model technology." },
    { title: "Anywhere, Anytime", description: "Practice on the go with our mobile-friendly platform." }
  ];

  return (
    <div className="bg-main rounded-xl shadow-md overflow-hidden my-8">
      <div className="p-12">
        {featureItems.map((item, index) => (
          <FeatureItem key={index} title={item.title} description={item.description} index={index} />
        ))}
      </div>
    </div>
  );
};

const Page: React.FC = () => {
  const { authUser } = useAuth();
  console.log(authUser);

  return (
    <div>
      <div className="heading-container p-12">
        <h1 className="text-secondaryText font-semibold text-3xl mb-8">
          Elevate Your Interview Skills, <span className="text-white ont-semibold text-3xl">One Question at a Time.</span>
        </h1>
        <FeaturesComponent/>
      </div>
    </div>
  );
};

export default Page;
