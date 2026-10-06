/* statement：汎用テキストスライド（見出し・リード・箇条書き・任意のSVG画像） */
SCENES.statement = function (root, d) {
  root.innerHTML = `
    <div class="st-wrap">
      ${U.header(d, { size: "lg" })}
      ${U.points(d.points, 1500)}
    </div>
    ${d.image ? `<img class="st-image rv" style="--d:600ms" src="${U.esc(d.image)}" alt="">` : ""}`;
};
