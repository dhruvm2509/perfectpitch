export function extractNumber(input: string): number {
	const match = input.match(/\d+/); // Matches any sequence of digits

	return match ? parseInt(match[0]) : 0;
}

// export function extractScoreAndAnalysis(input: string): {
// 	score: number;
// 	analysis: string;
// } {
// 	const scoreRegex = /Score:\s*(\d+)/;
// 	const analysisRegex = /\*\*Analysis:\*\*\s*(.*)/;

// 	const scoreMatch = input.match(scoreRegex);
// 	const analysisMatch = input.match(analysisRegex);

// 	if (!scoreMatch || !analysisMatch) {
// 		return { score: 0, analysis: "" };
// 	}

// 	const score = parseInt(scoreMatch[1]);
// 	const analysis = analysisMatch[1];
// 	return { score, analysis };
// }


export function extractScoreAndAnalysis(input: string): {
	score: number;
	analysis: string;
  } {
	// Define regex patterns to capture score and analysis text
	const scoreRegex = /Score:\s*(\d+)/;
	const analysisRegex = /Analysis:\s*(.*)/;
  
	// Attempt to match the patterns in the input string
	const scoreMatch = input.match(scoreRegex);
	const analysisMatch = input.match(analysisRegex);
  
	// Extract score if matched, defaulting to 0 if not found
	const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  
	// Extract analysis text if matched, defaulting to an empty string if not found
	const analysis = analysisMatch ? analysisMatch[1].trim() : "";
  
	return { score, analysis };
  }

  export function extractQuestions(input:string) {
	const questionsArray = JSON.parse(input);
	const questions = [
		"Experience and skills in extracting and manipulating large datasets using tools like Spark SQL and scripting languages.",
		"Understanding of predictive modeling algorithms for supervised and unsupervised learning, including classification, regression, and clustering.",
		"Familiarity with deep learning algorithms, such as CNN/RNN/LSTM/Transformer, and deep learning frameworks like TensorFlow or PyTorch.",
		"Examples of problems solved independently, highlighting teamwork and communication abilities.",
		"Experience in translating business questions into machine learning problems and developing innovative solutions.",
		"Process for implementing state-of-the-art machine learning models to improve business metrics.",
		"Understanding of causal inference models and their application in work.",
		"Experiences with Large Language Models and Generative AI.",
		"Approach to developing infrastructure tools to improve the development and deployment of machine learning models.",
		"Alignment of personal values with the mission and culture of Apple, as described in the job description."
	]
    return questionsArray || questions;
	}