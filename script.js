const commentsTop = [
  { position: 0.14, author: "Alice" },
  { position: 0.33, author: "Alice" },
  { position: 0.56, author: "Alice" },
];

const commentsBottom = [
  { position: 0.22, author: "Bob" },
  { position: 0.48, author: "Bob" },
  { position: 0.82, author: "Bob" },
];

const comments = [
  ...commentsTop.map((d) => ({ ...d, side: "top" })),
  ...commentsBottom.map((d) => ({ ...d, side: "bottom" })),
];

const wrapper = d3.select("#soundwave-wrapper");
const cursor = d3.select("#soundwave-cursor");

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

wrapper
  .on("mouseenter", () => {
    cursor.style("opacity", 1);
  })
  .on("mousemove", (event) => {
    const bounds = wrapper.node().getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const position = Math.max(0, Math.min(1, x / bounds.width));

    cursor.style("left", `${position * 100}%`);
    highlightNearestComment(position);
  })
  .on("mouseleave", () => {
    cursor.style("opacity", 0);
    wrapper.selectAll(".comment-dot").classed("is-nearest", false);
  });

createWave();

new ResizeObserver(createWave).observe(wrapper.node());
