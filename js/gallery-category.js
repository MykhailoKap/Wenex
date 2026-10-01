import "./main.js";
import "./common.js";
import { t as getCategory } from "./gallery-data.js";
//#region src/components/pages/gallery-category/gallery-category.js
function initGalleryCategory() {
	const root = document.querySelector("[data-fls-gallery-category]");
	if (!root) return;
	const category = getCategory(new URLSearchParams(window.location.search).get("cat") || "kuchnie");
	const title = root.querySelector("[data-gallery-category-title]");
	const description = root.querySelector("[data-gallery-category-description]");
	const items = root.querySelector("[data-gallery-category-items]");
	const empty = root.querySelector("[data-gallery-category-empty]");
	if (title) title.textContent = category.title;
	if (description) description.textContent = category.description;
	document.title = `${category.title} — Wenex`;
	if (!items) return;
	if (!category.projects.length) {
		if (empty) empty.hidden = false;
		return;
	}
	items.innerHTML = category.projects.map((project) => `
        <a class="gallery-category__card" href="./gallery-product.html?cat=${encodeURIComponent(category.id)}&project=${encodeURIComponent(project.id)}">
          <div class="gallery-category__card-media">
            ${project.cover ? `<img src="${project.cover}" alt="${project.title}" loading="lazy" />` : "<span class=\"gallery-category__placeholder\">Brak zdjęcia</span>"}
          </div>
          <div class="gallery-category__card-body">
            <h2 class="gallery-category__card-title">${project.title}</h2>
            <p class="gallery-category__card-count">${project.count} ${project.count === 1 ? "zdjęcie" : "zdjęć"}</p>
            <span class="gallery-category__card-arrow" aria-hidden="true">↗</span>
          </div>
        </a>
      `).join("");
}
initGalleryCategory();
//#endregion
