export function SendFlight() {
  return (
    <div className="send-flight" aria-hidden="true">
      <svg
        className="send-trail"
        viewBox="0 0 600 180"
        preserveAspectRatio="none"
      >
        <path d="M590 150C440 150 400 40 250 60S80 150 10 20" />
      </svg>
      <svg className="send-airplane" viewBox="0 0 120 80">
        <path
          fill="#fffdf6"
          stroke="#cfc4dc"
          d="M2 40 116 4 83 76 58 49 2 40Z"
        />
        <path fill="#e8dcf0" d="m58 49 58-45-42 55-16-10Z" />
        <path fill="#fff" d="m58 49-6 25 22-15Z" />
      </svg>
    </div>
  );
}
