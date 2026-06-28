const commentsTop = [
  {
    position: 0,
    author: "Alice",
    title: "Welcome",
    text: "Welcome to this collaborative sound review. Move your cursor or finger across the waveform to explore comments from the team at specific moments in the recording. Each marker highlights a discussion point, suggestion, or observation related to that part of the audio.",
  },
  {
    position: 0.33,
    author: "Alice",
    title: "Nice buildup",
    text: "The energy increases naturally here and creates anticipation for the next section.",
  },
  {
    position: 0.56,
    author: "Alice",
    title: "Peak could be stronger",
    text: "This feels like the emotional high point of the track, but the contrast with the previous section could be bigger.",
  },
];

const commentsBottom = [
  {
    position: 0.22,
    author: "Bob",
    title: "Shorten intro",
    text: "The first section might be slightly too long. Consider getting to the main idea a little sooner.",
  },
  {
    position: 0.48,
    author: "Bob",
    title: "Strong rhythm",
    text: "This section has a really good flow and pacing. It keeps the listener engaged.",
  },
  {
    position: 0.82,
    author: "Bob",
    title: "Satisfying ending",
    text: "The ending feels complete and leaves enough time for the final idea to settle.",
  },
];
const comments = [
  ...commentsTop.map((d) => ({ ...d, side: "top" })),
  ...commentsBottom.map((d) => ({ ...d, side: "bottom" })),
];

const wrapper = d3.select("#soundwave-wrapper");
const cursor = d3.select("#soundwave-cursor");
const popup = d3.select(".popup");

function renderComments(comments, className) {
  wrapper
    .selectAll(`.comment-dot.${className}`)
    .data(comments)
    .join("div")
    .attr("class", `comment-dot ${className}`)
    .style("left", (d) => `${d.position * 100}%`);
}

function highlightNearestComment(position) {
  const nearest = d3.least(comments, (d) => Math.abs(d.position - position));
  console.log(nearest);
  wrapper
    .selectAll(".comment-dot")
    .classed("is-nearest", (d) => d.position === nearest.position);
  popup.select("h3").text(nearest.author);
  popup.select("h2").text(nearest.title);
  popup.select("p").text(nearest.text);
}

function createWave() {
  const width = wrapper.node().clientWidth;
  const spacing = 10;
  const bars = Math.floor(width / spacing);

  const pattern = d3.range(bars).map((_, i) => {
    const x = i / (bars - 1);

    const envelope =
      0.15 +
      0.85 *
        (Math.exp(-Math.pow((x - 0.25) / 0.06, 2)) +
          Math.exp(-Math.pow((x - 0.38) / 0.08, 2)) +
          Math.exp(-Math.pow((x - 0.54) / 0.07, 2)) +
          Math.exp(-Math.pow((x - 0.82) / 0.08, 2)));

    const pulse = 0.65 + 0.35 * Math.sin(i * 1.35);

    return Math.min(110, 8 + envelope * pulse * 65);
  });

  d3.select("#soundwave")
    .selectAll(".soundwave-bar")
    .data(pattern)
    .join("div")
    .attr("class", "soundwave-bar")
    .style("height", (d) => `${d}px`);

  renderComments(commentsTop, "top");
  renderComments(commentsBottom, "bottom");
}

function updateCursor(event) {
  const bounds = wrapper.node().getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const position = Math.max(0, Math.min(1, x / bounds.width));

  cursor.style("left", `${position * 100}%`);
  highlightNearestComment(position);
}

wrapper
  .on("pointerdown", (event) => {
    wrapper.node().setPointerCapture(event.pointerId);
    updateCursor(event);
  })
  .on("pointermove", (event) => {
    if (event.pointerType === "touch" && event.pressure === 0) return;
    updateCursor(event);
  })
  .on("pointerup", (event) => {
    wrapper.node().releasePointerCapture(event.pointerId);
    if (event.pointerType === "touch") {
      cursor.interrupt().transition().style("left", "0%");
      highlightNearestComment(0);
    }
  })
  .on("pointercancel", (event) => {
    wrapper.node().releasePointerCapture(event.pointerId);
    if (event.pointerType === "touch") {
      cursor.interrupt().transition().style("left", "0%");
      highlightNearestComment(0);
    }
  })
  .on("mouseleave", () => {
    cursor.interrupt().transition().style("left", "0%");
    highlightNearestComment(0);
  });
createWave();
highlightNearestComment(0);

new ResizeObserver(createWave).observe(wrapper.node());
