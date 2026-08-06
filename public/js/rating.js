


document.addEventListener("DOMContentLoaded", () => {
    const selected = document.querySelector(".rating");
    const checkboxArea = document.getElementById("rated_choice");
    // ฟัง event change
    selected.addEventListener("change", () => {
        // เคลียร์ตัวเดิมก่อน
        if (selected.value === "rated") {
            checkboxArea.innerHTML = `
        <form class="d-flex flex-column">
            <input type="checkbox" id="vehicle1" name="vehicle1" value="Bike">
            <label for="vehicle1"> I have a bike</label><br>
            <input type="checkbox" id="vehicle2" name="vehicle2" value="Car">
            <label for="vehicle2"> I have a car</label><br>
            <input type="checkbox" id="vehicle3" name="vehicle3" value="Boat">
            <label for="vehicle3"> I have a boat</label><br><br>
        </form>
        `;
        }
    });
})
// const selected = document.getElementById("rating");
// const checkboxArea = document.getElementById("rated_choice");

// document.addEventListener("DOMContentLoaded", () => {
//     // ฟัง event change
//     selected.addEventListener("change", () => {
//         // เคลียร์พื้นที่
//         checkboxArea.innerHTML = "";

//         if (selected.value === "rated") {
//             // สร้าง div ครอบ checkbox
//             const wrapper = document.createElement("div");
//             wrapper.className = "d-flex flex-column";

//             // สร้าง checkbox
//             const option1 = document.createElement("label");
//             option1.innerHTML = `<input type="checkbox" value="ความรุนแรง"/> ความรุนแรง`;

//             const option2 = document.createElement("label");
//             option2.innerHTML = `<input type="checkbox" value="คำหยาบ/ไม่เหมาะสม"/> คำหยาบ/ไม่เหมาะสม`;

//             // เพิ่มเข้า wrapper
//             wrapper.appendChild(option1);
//             wrapper.appendChild(option2);

//             // เพิ่มเข้า DOM
//             checkboxArea.appendChild(wrapper);
//         }
//     });
// })
