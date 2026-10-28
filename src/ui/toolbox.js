/* Builds a checkbox for each firework type that adds or removes it from the enabled pool */
export function buildToolbox(container, types, enabled) {
  const checkboxes = [];

  // The last enabled type is locked so the pool can never be empty
  function updateLocks() {
    for (const box of checkboxes) {
      box.disabled = box.checked && enabled.size === 1;
    }
  }

  for (const [key, type] of Object.entries(types)) {
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = enabled.has(key);

    box.addEventListener("change", () => {
      if (box.checked) enabled.add(key);
      else enabled.delete(key);
      updateLocks();
    });

    label.append(box, type.label);
    container.append(label);
    checkboxes.push(box);
  }

  updateLocks();
}