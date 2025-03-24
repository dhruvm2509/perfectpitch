import Link from "next/link";

export default function Index() {
  return (
    <>
      <style >{`
        /* DEMO-SPECIFIC STYLES */
        .typewriter h1 {
          color: cornflowerblue;
          font-family: monospace;
          overflow: hidden; /* Ensures the content is not revealed until the animation */
          border-right: 0.15em solid orange; /* The typewriter cursor */
          white-space: nowrap; /* Keeps the content on a single line */
          margin: 0 auto; /* Gives that scrolling effect as the typing happens */
          letter-spacing: 0.15em; /* Adjust as needed */
          animation: typing 3.5s steps(30, end),
            blink-caret 0.5s step-end infinite;
        }

        /* The typing effect */
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        /* The typewriter cursor effect */
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: orange }
        }
      `}</style>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="text-center font-medium mt-32">
          <p className="text-6xl mb-3">Interview Confidence</p>
          <p className="text-6xl" style={{ color: 'cornflowerblue' }}>
            Crafted Just for You.
          </p>
        </div>

        <Link href="/dashboard" passHref>
          <div className="inline-flex items-center gap-2 py-3 px-6 bg-white text-secondaryText font-bold text-lg leading-6 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="typewriter"><h1>Let's get started</h1></div>
            <svg className="w-6 h-6" fill="none" stroke="cornflowerblue" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </Link>
        
      </div>
    </>
  );
}
