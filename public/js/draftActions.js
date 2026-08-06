document.addEventListener("DOMContentLoaded", () => {
    const draftContainer = document.querySelector(".draftNov");
    if (!draftContainer) return;

    draftContainer.addEventListener("click", async (e) => {
        const publishBtn = e.target.closest(".btn_publishfromDraft");
        const deleteBtn = e.target.closest(".btn_deleteromDraft");

        if (publishBtn) {
            const card = publishBtn.closest(".bg-light");
            const draftId = card.querySelector("a.btn-warning").dataset.id;

            if (!confirm("คุณแน่ใจที่จะเผยแพร่เรื่องนี้?")) return;

            try {
                const res = await fetch(`/works/publish/${draftId}`, { method: "PUT" });
                const data = await res.json();
                if (data.success) {
                    const publishedContainer = document.getElementById("writtenNov");
                    const title = card.querySelector("strong").textContent;
                    const newHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 rounded bg-light w-100">
              <strong>${title}</strong>
              <a href="/works/${draftId}" class="btn btn-primary btn-sm">แก้ไข</a>
            </div>
          `;
                    publishedContainer.insertAdjacentHTML("afterbegin", newHTML);
                    card.remove();
                } else {
                    alert("เผยแพร่ล้มเหลว");
                }
            } catch (err) {
                console.error(err);
                alert("เกิดข้อผิดพลาด");
            }
        }

        if (deleteBtn) {
            const card = deleteBtn.closest(".bg-light");
            const draftId = card.querySelector("a.btn-warning").dataset.id;

            if (!confirm("คุณแน่ใจที่จะลบเรื่องนี้ทิ้ง?")) return;

            try {
                const res = await fetch(`/works/${draftId}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) card.remove();
                else alert("ลบล้มเหลว");
            } catch (err) {
                console.error(err);
                alert("เกิดข้อผิดพลาด");
            }
        }
    });
});
