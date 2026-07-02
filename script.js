let commentsTop = [];
let commentsBottom = [];
let comments = [];

async function loadComments() {
  const response = await fetch("./comments.json");
  const data = await response.json();

  commentsTop = data.top;
  commentsBottom = data.bottom;

  comments = [
    ...commentsTop.map((d) => ({ ...d, side: "top" })),
    ...commentsBottom.map((d) => ({ ...d, side: "bottom" })),
  ];

  createWave();
  highlightNearestComment(0);
  updatePassedBars(0);
}

loadComments();
const wrapper = d3.select("#soundwave-wrapper");
const cursor = d3.select("#soundwave-cursor");
const popup = d3.select(".popup");

let isDragging = false;
let currentPosition = 0;

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

  wrapper
    .selectAll(".comment-dot")
    .classed("is-nearest", (d) => d.position === nearest.position);

  const image = popup.select(".popup-image");

  if (nearest.image) {
    image.attr("src", nearest.image).style("display", "block");
  } else {
    image.attr("src", "").style("display", "none");
  }

  popup.select("h3").text(nearest.top || "");
  popup.select("h2").text(nearest.title || "");
  popup.select("p").text(nearest.text || "");
}

function updatePassedBars(position) {
  d3.selectAll(".soundwave-bar").classed("passed", (d) => d.x <= position);
}

function createWave() {
  const width = wrapper.node().clientWidth;
  const spacing = 6;
  const bars = Math.floor(width / spacing);

  const pattern = d3.range(bars).map((_, i) => {
    const x = bars <= 1 ? 0 : i / (bars - 1);

    const peaks = [
      { position: 0.08, width: 0.035, strength: 0.7 },
      { position: 0.18, width: 0.05, strength: 1.1 },
      { position: 0.28, width: 0.04, strength: 0.8 },
      { position: 0.33, width: 0.025, strength: -0.8 },
      { position: 0.38, width: 0.06, strength: 1.2 },
      { position: 0.52, width: 0.045, strength: 1.0 },
      { position: 0.58, width: 0.03, strength: -1.2 },
      { position: 0.64, width: 0.04, strength: 0.75 },
      { position: 0.76, width: 0.055, strength: 1.2 },
      { position: 0.84, width: 0.02, strength: -0.6 },
      { position: 0.9, width: 0.04, strength: 0.9 },
    ];

    const envelope = Math.max(
      0.05,
      0.12 +
        peaks.reduce((sum, peak) => {
          return (
            sum +
            peak.strength *
              Math.exp(-Math.pow((x - peak.position) / peak.width, 2))
          );
        }, 0),
    );

    const pulse = 0.65 + 0.35 * Math.sin(i * 1.35);

    return {
      x,
      height: Math.min(110, 8 + envelope * pulse * 65),
    };
  });

  d3.select("#soundwave")
    .selectAll(".soundwave-bar")
    .data(pattern)
    .join("div")
    .attr("class", "soundwave-bar")
    .style("height", (d) => `${d.height}px`);

  renderComments(commentsTop, "top");
  renderComments(commentsBottom, "bottom");
  updatePassedBars(currentPosition);
}

function updateCursor(event) {
  const bounds = wrapper.node().getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const position = Math.max(0, Math.min(1, x / bounds.width));

  currentPosition = position;

  cursor.style("left", `${position * 100}%`);
  updatePassedBars(position);
  highlightNearestComment(position);
}

wrapper
  .on("pointerdown", (event) => {
    isDragging = true;
    wrapper.node().setPointerCapture(event.pointerId);
    updateCursor(event);
  })
  .on("pointermove", (event) => {
    if (!isDragging && event.pointerType === "touch") return;

    event.preventDefault();
    updateCursor(event);
  })
  .on("pointerup", (event) => {
    isDragging = false;
    wrapper.node().releasePointerCapture(event.pointerId);
  })
  .on("pointercancel", (event) => {
    isDragging = false;
    wrapper.node().releasePointerCapture(event.pointerId);
  });

new ResizeObserver(createWave).observe(wrapper.node());
