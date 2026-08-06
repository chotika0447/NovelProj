const image = document.querySelector(".profImg"),
    input = document.querySelector("#profFile")

// คลิกที่รูปให้เปิดมาหน้าเลือกไฟล์
image.addEventListener("click", () => {
    input.click();
});

input.addEventListener("change",()=>{
    image.src = URL.createObjectURL(input.files[0]);
})