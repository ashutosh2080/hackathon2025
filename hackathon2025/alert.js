document.getElementById("createBtn").addEventListener("click", function () {
    let name = document.getElementById("alertName").value;
    let seriousness = document.getElementById("seriousness").value;
    let message = document.getElementById("alertMessage").value;
    let location = document.getElementById("location").value;
    let time = document.getElementById("time").value;

    if (!name || !seriousness || !message || !location || !time) {
        alert("Please fill all fields");
        return;
    }

    let list = document.getElementById("alertList");

    let row = document.createElement("div");
    row.classList.add("alert-row", `serious-${seriousness}`);

    row.innerHTML = `
        <strong>${name}</strong>
        <span>${message}</span>
        <span>${location}</span>
        <span>${time}</span>
    `;

    list.appendChild(row);
});
