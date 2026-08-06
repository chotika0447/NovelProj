const profImg = document.querySelector(".profImg");
const profFile = document.querySelector("#profFile");
if (!profImg || !profFile) return;

profImg.addEventListener("click", () => profFile.click());

profFile.addEventListener("change", async () => {
    const file = profFile.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    //ส่งไปบันทึกที่server
    try {
        const res = await fetch("/upload/profile", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) profImg.src = data.url;
        window.profileUrl = data.url;
    } catch (err) {
        console.error(err);
    }
});