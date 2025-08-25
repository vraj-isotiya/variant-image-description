// window.addEventListener("pageshow", function () {
//   const productGrids = document.querySelectorAll(".grid.product-grid");

//   productGrids.forEach((productGrid) => {
//     const sectionId = productGrid.getAttribute("data-section-id");
//     const variantDataMap =
//       window["variantDataMap" + sectionId.replace(/-/g, "_")];

//     if (!variantDataMap) return;

//     const cards = productGrid.querySelectorAll(
//       `.card-product-custom-div[data-section-id="${sectionId}"]`
//     );

//     cards.forEach((card) => {
//       // Reset swatches to default variant
//       const swatches = card.querySelectorAll(
//         ".collection-product-card__swatch input[type=radio]"
//       );

//       swatches.forEach((input) => {
//         input.checked = input.hasAttribute("checked");
//       });

//       // Update product image and links for selected variant
//       const selectedInput = card.querySelector(
//         ".collection-product-card__swatch input[type=radio]:checked"
//       );
//       if (selectedInput) {
//         const variantId = selectedInput.getAttribute("data-variant-id");
//         const variantData = variantDataMap[variantId];
//         if (variantData) {
//           const productImage = card.querySelector(".card__media img");
//           if (productImage) {
//             const dynamicSrcset = [
//               `${variantData.imageUrl}?width=165 165w`,
//               `${variantData.imageUrl}?width=360 360w`,
//               `${variantData.imageUrl}?width=533 533w`,
//               `${variantData.imageUrl}?width=720 720w`,
//               `${variantData.imageUrl}?width=940 940w`,
//               `${variantData.imageUrl}?width=1066 1066w`,
//             ].join(", ");
//             productImage.srcset = dynamicSrcset;
//             productImage.src = variantData.imageUrl;
//           }

//           const productLinks = card.querySelectorAll(
//             'a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"]'
//           );
//           productLinks.forEach((link) => (link.href = variantData.productUrl));
//         }
//       }
//     });

//     // Handle swatch change
//     productGrid.addEventListener("change", function (e) {
//       if (
//         e.target.matches(`input[type="radio"][data-section-id="${sectionId}"]`)
//       ) {
//         const card = e.target.closest(
//           `.card-product-custom-div[data-section-id="${sectionId}"]`
//         );
//         const variantId = e.target.getAttribute("data-variant-id");
//         const variantData = variantDataMap[variantId];

//         if (!variantData) return;

//         const productImage = card.querySelector(".card__media img");
//         if (productImage) {
//           const dynamicSrcset = [
//             `${variantData.imageUrl}?width=165 165w`,
//             `${variantData.imageUrl}?width=360 360w`,
//             `${variantData.imageUrl}?width=533 533w`,
//             `${variantData.imageUrl}?width=720 720w`,
//             `${variantData.imageUrl}?width=940 940w`,
//             `${variantData.imageUrl}?width=1066 1066w`,
//           ].join(", ");
//           productImage.srcset = dynamicSrcset;
//           productImage.src = variantData.imageUrl;
//         }

//         const productLinks = card.querySelectorAll(
//           'a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"]'
//         );
//         productLinks.forEach((link) => (link.href = variantData.productUrl));
//       }
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const grids = document.querySelectorAll(".grid.product-grid");

  const updateCardVariant = (card, variantData, firstVariantData, isColor) => {
    // If no data, bail
    const dataToUse =
      variantData && variantData.imageUrl ? variantData : firstVariantData;
    if (!dataToUse) return;

    // === Only update images if Color swatch ===
    if (isColor) {
      const img = card.querySelector(".card__media img");
      if (img) {
        img.src = dataToUse.imageUrl;
        img.srcset = [165, 360, 533, 720, 940, 1066]
          .map((w) => `${dataToUse.imageUrl}?width=${w} ${w}w`)
          .join(", ");
      }

      const secondImg = card.querySelector(".card__media img:nth-of-type(2)");
      if (secondImg) {
        const secondSrc = dataToUse.secondImageUrl || dataToUse.imageUrl;
        secondImg.src = secondSrc;
        secondImg.srcset = [165, 360, 533, 720, 940, 1066]
          .map((w) => `${secondSrc}?width=${w} ${w}w`)
          .join(", ");
      }
    }

    // === Always update product links ===
    card
      .querySelectorAll('a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"]')
      .forEach((a) => (a.href = dataToUse.productUrl));
  };

  // === Update size swatches based on selected color ===
  const updateSizeSwatches = (card, selectedColor, map) => {
    const sizeInputs = card.querySelectorAll(
      '.tr-collection-product-card__swatch input[data-option-name="Size"]'
    );

    sizeInputs.forEach((input) => {
      const sizeValue = input.value;
      const match = Object.values(map).find(
        (v) => v.options.color === selectedColor && v.options.size === sizeValue
      );

      const label = input.parentElement.querySelector("label");
      if (match?.available) {
        input.disabled = false;
        label?.classList.remove("disabled-swatch");
      } else {
        input.disabled = true;
        input.checked = false;
        label?.classList.add("disabled-swatch");
      }
    });

    // Auto-select first available size
    const firstAvailable = [...sizeInputs].find((i) => !i.disabled);
    if (firstAvailable && ![...sizeInputs].some((i) => i.checked)) {
      firstAvailable.checked = true;
    }
  };

  const updatePrice = (card, variantData) => {
    if (!variantData) {
      return;
    }
    const priceSpan = card.querySelector(".price-item.price-item--regular");
    if (priceSpan) {
      priceSpan.textContent = variantData.price;
    }
  };

  grids.forEach((grid) => {
    const sectionId = grid.getAttribute("data-section-id");
    const map = window["variantDataMap" + sectionId.replace(/-/g, "_")];

    if (!map) {
      return;
    }

    // Handle swatch click/change
    grid.addEventListener("change", (e) => {
      if (
        !e.target.matches(
          `.tr-collection-product-card__swatch input[type="radio"][data-section-id="${sectionId}"]`
        )
      ) {
        return;
      }

      const card = e.target.closest(
        `.card-product-custom-div[data-section-id="${sectionId}"]`
      );

      if (!card) return;

      const firstSwatch = card.querySelector(
        `.tr-collection-product-card__swatch input[type="radio"]`
      );
      let firstVariantData = firstSwatch
        ? map[firstSwatch.dataset.variantId]
        : null;
      if (firstVariantData && firstSwatch?.dataset.secondImageUrl) {
        firstVariantData = {
          ...firstVariantData,
          secondImageUrl: firstSwatch.dataset.secondImageUrl,
        };
      }

      const variantId = e.target.dataset.variantId;
      const variantData = map[variantId];
      if (variantData) {
        variantData.secondImageUrl = e.target.dataset.secondImageUrl || null;
      }

      const optionName = e.target.dataset.optionName;

      // If color swatch clicked → update sizes
      if (optionName === "Color") {
        updateSizeSwatches(card, e.target.value, map);
      }

      updateCardVariant(
        card,
        variantData,
        firstVariantData,
        optionName === "Color"
      );
      updatePrice(card, variantData);
    });

    // Initial render
    grid
      .querySelectorAll(
        `.card-product-custom-div[data-section-id="${sectionId}"]`
      )
      .forEach((card) => {
        const selected =
          card.querySelector(
            `.tr-collection-product-card__swatch input[type="radio"][checked]`
          ) ||
          card.querySelector(
            `.tr-collection-product-card__swatch input[type="radio"]`
          );
        if (!selected) return;
        selected.checked = true;

        const firstSwatch = card.querySelector(
          `.tr-collection-product-card__swatch input[type="radio"]`
        );
        let firstVariantData = firstSwatch
          ? map[firstSwatch.dataset.variantId]
          : null;
        if (firstVariantData && firstSwatch?.dataset.secondImageUrl) {
          firstVariantData = {
            ...firstVariantData,
            secondImageUrl: firstSwatch.dataset.secondImageUrl,
          };
        }

        const variantData = map[selected.dataset.variantId];
        if (variantData) {
          variantData.secondImageUrl = selected.dataset.secondImageUrl || null;
        }

        const optionName = selected.dataset.optionName;

        // Default render
        if (optionName === "Color") {
          updateSizeSwatches(card, selected.value, map);
        }

        updateCardVariant(
          card,
          variantData,
          firstVariantData,
          optionName === "Color"
        );
        updatePrice(card, variantData);
      });
  });
});
