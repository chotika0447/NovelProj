let count = 1;
let chapterContents = {};
let book = null;
let currentBookId = null;

document.addEventListener("DOMContentLoaded", async () => {

  const screen = document.getElementById("rightScreen");
  currentBookId = screen.dataset.bookId;

  if (currentBookId) {
    const res = await fetch(`/writer/api/book/${currentBookId}`);
    const data = await res.json();
    if (data.success) {
      book = data.book;
      currentBookId = book._id;
      count = book.chapters ? book.chapters.length + 1 : 1;

      screen.innerHTML = baseInfo();
      prefillForm(book);
      coverUpload();

      if (book.chapters && book.chapters.length > 0) {
        const listArea = document.getElementById("epList");
        listArea.innerHTML = "";
        book.chapters.forEach((ch, index) => {
          const num = index + 1;
          chapterContents[num] = ch.content || "";
          listArea.insertAdjacentHTML("beforeend", addNewEp(num, ch._id));
        });
        document.querySelector("#totalEPs").textContent = `ตอนทั้งหมด (${book.chapters.length})`;
      }
    }
  } else {
    screen.innerHTML = baseInfo();
    coverUpload();
  }

  const bookBtn = document.getElementById("novSetting_btn");
  bookBtn?.addEventListener("click", () => {
    screen.innerHTML = baseInfo();
    if (book) {
      prefillForm(book);
      coverUpload();
    }
  });

  const addEp_btn = document.getElementById("moreEp");
  addEp_btn?.addEventListener("click", async () => {
    if (!currentBookId) {
      alert("กรุณาบันทึกข้อมูลเล่มก่อนเพิ่มตอนใหม่");
      return;
    }
    try {
      const res = await fetch(`/writer/${currentBookId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `ตอนที่ ${count}`, content: "" })
      });
      const data = await res.json();
      if (data.success) {
        const ch = data.chapter;
        const listArea = document.getElementById("epList");
        listArea.insertAdjacentHTML("beforeend", addNewEp(count, ch._id));
        chapterContents[count] = "";
        document.querySelector("#totalEPs").textContent = `ตอนทั้งหมด (${data.totalChapters})`;
        count++;
      }
    } catch (err) {
      console.error(err);
    }
  });

  const listArea = document.getElementById("epList");
  listArea.addEventListener("click", async (e) => {
    if (e.target.id === "btn_deleteEp") {
      const epDiv = e.target.closest("div.d-flex.flex-row");
      const epId = epDiv.dataset.epId;
      if (confirm("คุณแน่ใจที่จะลบตอนนี้ทิ้งหรือไม่?")) {
        fetch(`/writer/${currentBookId}/chapters/${epId}`, { method: "DELETE" })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              epDiv.remove();
              document.querySelector("#totalEPs").textContent = `ตอนทั้งหมด (${data.totalChapters})`;
            }
          }).catch(err => console.error(err));
      }
      return;
    }

    const btn = e.target.closest(".eachEP");
    if (btn) {
      const num = parseInt(btn.querySelector("strong").textContent.match(/\d+/)[0]);
      screen.innerHTML = addEpContent(num, book.title);
      const textarea = document.getElementById("epContent");
      const epTitleInput = document.getElementById("epTitle");
      const updateDay = document.getElementById("updateDay");
      const letterCount = document.getElementById("letterCount");

      if (chapterContents[num]) textarea.value = chapterContents[num];
      if (chapterContents[num + '_title']) epTitleInput.value = chapterContents[num + '_title'];

      textarea.addEventListener("input", () => {
        chapterContents[num] = textarea.value;
        letterCount.textContent = `${textarea.value.length} ตัวอักษร`;
        const now = new Date();
        updateDay.textContent = `อัพเดตเมื่อ: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      });

      epTitleInput.addEventListener("input", () => {
        chapterContents[num + '_title'] = epTitleInput.value;
        const allEPs = document.querySelectorAll(".eachEP");
        allEPs.forEach(btn => {
          const epNum = parseInt(btn.querySelector("strong").textContent.match(/\d+/)[0]);
          if (epNum === num) {
            btn.querySelector("strong").textContent = `ตอนที่ ${num}: ${epTitleInput.value}`;
          }
        });
      });
    }
  });

  const tagInput = document.querySelector("#tagInput");
  const addTagBtn = document.querySelector("#addTag");
  const tagContainer = document.querySelector("#tagContainer");

  addTagBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const text = tagInput.value.trim();
    if (text !== "") {
      tagContainer.insertAdjacentHTML("beforeend", createTag(text));
      tagInput.value = "";
    }
  });

  tagContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("removeTag")) {
      e.target.parentElement.remove();
    }
  });
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "form") {
    event.preventDefault();

    const warningParagraph = document.getElementById("warning");
    let errMessages = [];

    const bookTitleInput = document.getElementById("novTitle");
    const mainCateChoice = document.getElementById("mainCate");
    const ratingChoice = document.getElementById("rating");
    const bookQuoteInput = document.getElementById("novQuote");
    const bookShortsInput = document.getElementById("novShorts");

    if (bookTitleInput.value.trim() === "") {
      errMessages.push("กรุณากรอก ชื่อเรื่อง");
      bookTitleInput.classList.add("is-invalid");
    }
    if (bookQuoteInput.value.trim() === "") {
      errMessages.push("กรุณากรอก คำโปรย");
      bookQuoteInput.classList.add("is-invalid");
    }
    if (bookShortsInput.value.trim() === "") {
      errMessages.push("กรุณากรอก เนื้อเรื่องย่อ");
      bookShortsInput.classList.add("is-invalid");
    }
    if (mainCateChoice.value === "") {
      errMessages.push("กรุณาเลือก หมวดหมู่หลัก");
      mainCateChoice.classList.add("is-invalid");
    }
    if (ratingChoice.value === "") {
      errMessages.push("กรุณาเลือก ระดับของเนื้อหา");
      ratingChoice.classList.add("is-invalid");
    }

    if (errMessages.length > 0) {
      warningParagraph.innerHTML = errMessages.join("<br>");
      warningParagraph.classList.add("text-danger");
      return;
    }

    const payload = {
      bookId: currentBookId,
      title: bookTitleInput.value,
      category: mainCateChoice.value,  // map เป็น category
      desc: bookShortsInput.value,     // map เป็น desc
      img: window.coverUrl || "",
      isPublic: true
    };


    try {
      const res = await fetch("/writer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        warningParagraph.innerHTML = "<span class='text-success'>✅ บันทึกสำเร็จ!</span>";
        window.currentBookId = data.bookId;
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } else {
        warningParagraph.innerHTML = "<span class='text-danger'>❌ เกิดข้อผิดพลาดในการบันทึก</span>";
      }

    } catch (err) {
      console.error(err);
      warningParagraph.innerHTML = "<span class='text-danger'>❌ เกิดข้อผิดพลาดในการบันทึก</span>";
    }
  }
});

//-----------------------Function---------------------------------

function createTag(text) {
  return `
    <div class="d-flex flex-row align-items-center gap-1 border border-2 rounded-5 px-2 py-1" style="border-color: rgba(255, 225, 0, 1)">
      ${text}
      <button class="removeTag border-0 px-2 py-1 bg-light text-center">x</button>
    </div>
  `;
}

function addNewEp(num, chId, title = "") {
  return `
    <div class="d-flex flex-row justify-content-between gap-2 align-items-center" data-ep-id="${chId}">
      <button class="eachEP border-0 rounded h-auto text-start p-2 mb-2 w-100" style="background-color: rgb(212, 212, 212);">
        <strong>ตอนที่ ${num}${title ? ': ' + title : ''}</strong>
      </button>
      <button id="btn_deleteEp" class="border-0 rounded-circle bg-danger text-white px-2"> X </button>
    </div>
  `;
}

function addEpContent(num, bookTitle, content = "", epTitle = "") {
  return `
    <div class="d-flex flex-column h-100">
      <div class="d-flex justify-content-end align-items-center p-3 gap-2">
        <button class="btn btn-light btn-sm">บันทึกแบบร่าง</button>
        <button class="btn btn-light btn-sm">บันทึกและเผยแพร่</button>
      </div>

      <div class="p-3 bg-light">
        <h5 id="novTitle"><strong>${bookTitle}</strong></h5>
      </div>

      <div class="flex-grow-1 d-flex flex-column text-dark">
        <div class="border-bottom text-center py-3 fs-4">
          <strong>ตอนที่ ${num}#: </strong>
          <input id="epTitle" class="border-0 fw-bold fs-5" placeholder="ยังไม่ตั้งชื่อตอน" value="${epTitle}">
        </div>
        <div class="d-flex justify-content-end gap-3 p-2 text-dark">
          <p id="updateDay">อัพเดตเมื่อ: xx/xx/xx</p>
          <p id="letterCount">${content.length} ตัวอักษร</p>
        </div>
        <div class="flex-grow-1 p-3 d-flex justify-content-center align-items-center">
          <textarea id="epContent" class="w-100 h-100 p-3 border-0 rounded"
            style="background-color: rgba(203, 219, 223, 1);"
            placeholder="พิมพ์ข้อความที่นี่">${content}</textarea>
        </div>
      </div>
    </div>
  `;
}

//หน้าตั้งค่าข้อมูลพื้นฐานนิยาย
function baseInfo() {
  return `
    <div class="d-flex flex-column p-3" style="background-color: rgba(238, 214, 117, 1); color: black;">
      <div class="d-flex flex-column bg-light border-0 rounded">
        <h3 class="d-flex justify-content-center border-0 rounded h-auto p-4 bg-light fw-bold">
        ตั้งค่าข้อมูลพื้นฐานของนิยาย</h3>

        <!-- เริ่มส่วนฟอร์ม -->
        <form id="form" class="d-flex flex-column mx-5 mb-4 mt-0" >
          <!-- แถว1 -->
          <!-- style="background-color: rgba(238, 214, 117, 1)" -->
          <label class="fw-bold fs-5 mb-1">ตั้งชื่อเรื่อง*</label>
          <input class="form-control border rounded mb-3  p-2" style="width:400px; height:50px; "
            id="novTitle" placeholder="ชื่อเรื่อง">

          <!-- แถว2 -->
          <div class="d-flex mb-3 gap-2 bg-light">

            <!-- ฝั่งซ้าย-->
            <div style="width:40%; resize: none;">
              <!-- รูป&ปุ่มเลือกไฟล์-->
              <label class="fw-bold fs-5 mb-3">ปกเรื่องแนวตั้ง</label>
              <div class="d-flex flex-column align-items-center justify-content-center" >
                <img 
                class="recCovImg border-0 rounded my-3"
                style="width: 280px; height: 330px; object-fit: cover; cursor: pointer;"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNUOu5kkYIXpcfVS97f1I42o9MnsCL2RrN_33gNdUYpUNKT9hwBe7Oko7lW_-TQ_Y7kKM&usqp=CAU" />
                <input id="recCovFile" type="file" accept="image/*" style="display:none;">
              </div>
            </div>

            <!-- ฝั่งขวา-->
            <div class="d-flex flex-column flex-grow-1" >
              <!-- หมวดหมู่ -->
              <div class="d-flex flex-row p-2 gap-5 mb-2">
                <div class="dropdown">
                  <label class="fw-bold">หมวดหมู่หลัก*</label>
                  <select class="form-control" name="mainCate" id="mainCate" style="width: 200px;">
                      <option value="" disabled selected>เลือก</option>
                      <option value="Romantic">โรแมนติก</option>
                      <option value="Fantasy">แฟนตาซี</option>
                      <option value="Action">ต่อสู้</option>
                      <option value="Horror">สยองขวัญ</option>
                      <option value="Adventure">ผจญภัย</option>
                      <option value="Mystery">ปริศนา</option>
                      <option value="Sci-Fi">ไซไฟ</option>
                  </select>
                </div>
                <div class="dropdown">
                  <label class="fw-bold">หมวดหมู่รอง</label>
                  <select class="form-control" name="secondCate" id="secondCate" style="width: 200px;">
                      <option value="" disabled selected>เลือก</option>
                      <option value="romance">โรแมนติก</option>
                      <option value="fantasy">แฟนตาซี</option>
                      <option value="fight">ต่อสู้</option>
                      <option value="horror">สยองขวัญ</option>
                      <option value="adventure">ผจญภัย</option>
                      <option value="mystery">ปริศนา</option>
                      <option value="sci-fi">ไซไฟ</option>
                  </select>
                </div>
              </div>

              <!-- เรต -->
              <div class="d-flex flex-column p-2 gap-3 mb-2">
                <div class="dropdown">
                  <label class="fw-bold">ระดับของเนื้อหา*</label>
                  <select class="rating form-control" name="rating" id="rating">
                      <option value="" disabled selected>เลือก</option>
                      <option value="general">เหมาะสมกับบุคคลทั่วไป</option>
                      <option value="rated">เหมาะสมกับผู้ที่มีอายุ 18 ปีขึ้นไป</option>
                  </select>
                  <div id="rated_choice"></div>
                </div>
                
              </div>

              <!-- แท็ก -->
              <div class="p-2" >
                <label class="fw-bold">แท็ก</label>
                <input id="tagInput" class="border rounded bg-white" style="width:120px"/>
                <button class="border rounded bg-light" id="addTag">เพิ่ม</button>
                <div id="tagContainer" class="d-flex flex-row flex-wrap border-0 rounded p-2 gap-3 mt-2">
                </div>
              </div>
              <!-- คำโปรย -->
              <label class="fw-bold mb-0 m-2">คำโปรย*</label>
              <div class="m-2">
                <textarea class="form-control border-0 rounded p-3  mt-1 mb-3" style="resize: none; height:90px; background-color: rgba(208, 230, 235, 1);"
                id="novQuote" placeholder="พิมพ์คำโปรย"></textarea>
              </div>
              
            </div>
          </div>

          <!-- แถว3 -->
          <div class="d-flex flex-column" >
            <label class="fw-bold mb-2 fs-5">เรื่องย่อ*</label>
            <textarea 
              class="form-control border-0 rounded p-3"
              style="resize: none; height:150px; background-color: rgba(208, 230, 235, 1);"
              id="novShorts" 
              placeholder="พิมพ์เรื่องย่อ"></textarea>
          </div>
          <div class="d-flex justify-content-center m-4" >
            <button
            type="submit"
            class="border-0 rounded p-2 px-3 fw-bold text-white"
            style=" background-color: rgba(43, 168, 47, 1)">บันทึก</button>
          </div>
          <div id="warning" class="w-auto"></div>
        </form>
        
        
      </div>
    </div>
  `;

}

async function prefillForm(book) {
  if (!book) return;

  window.currentBookId = book._id;

  document.getElementById("novTitle").value = book.title || "";
  document.getElementById("mainCate").value = book.mainCate || "";
  document.getElementById("secondCate").value = book.secondCate || "";
  document.getElementById("rating").value = book.rating || "";
  document.getElementById("novQuote").value = book.quote || "";
  document.getElementById("novShorts").value = book.shorts || "";

  if (book.tags && book.tags.length > 0) {
    const tagContainer = document.getElementById("tagContainer");
    tagContainer.innerHTML = "";
    book.tags.forEach(tag => {
      tagContainer.insertAdjacentHTML("beforeend", createTag(tag));
    });
  }

  const recCovImg = document.querySelector(".recCovImg");
  if (recCovImg && book.coverUrl) {
    recCovImg.src = book.coverUrl;
    window.coverUrl = book.coverUrl;
  }
}

function coverUpload() {
  const recCovImg = document.querySelector(".recCovImg");
  const recCovFile = document.querySelector("#recCovFile");

  if (!recCovImg || !recCovFile) return;

  recCovImg.addEventListener("click", () => recCovFile.click());

  recCovFile.addEventListener("change", async () => {
    const file = recCovFile.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file);

    try {
      const res = await fetch("/writer/upload/cover", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        recCovImg.src = data.url;
        window.coverUrl = data.url;
      } else {
        alert("อัปโหลดรูปไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
    }
  });
}