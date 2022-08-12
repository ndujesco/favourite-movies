let latestCardContent;
const askDelete =  async (btn) => {
    document.body.classList.add("stop-flow")
    const movieElement = btn.closest(".card");
    latestCardContent = movieElement.querySelector(".back").innerHTML;
    const movieId = btn.parentNode.querySelector("[name=movieId]").value;
    const title = btn.parentNode.querySelector(".title").innerHTML;
    const cardDetails = movieElement.querySelector(".back");
    cardDetails.innerHTML = `
    <div>
        <div> <em>Remove</em> <b>${title}?<b></div>
        <br><a class="button" onclick="restore(this)">No</a>
        <input type="hidden" name="movieId" value=${movieId}>
        <a class="button delete-button" onclick="deleteMovie(this)" type="btn">Yes</a>
    </div>`
}

const deleteMovie = async (btn) => {
    document.body.classList.remove("stop-flow")
    const movieElement = btn.closest(".card")
    const movieId = btn.parentNode.querySelector("[name=movieId]").value;
    await fetch("/delete?movieId=" + movieId, {
        method: "DELETE"
    })
    movieElement.parentNode.removeChild(movieElement)
    document.querySelectorAll("p.large").forEach((element, index, array) => {
        element.innerHTML = array.length - index
    });
}

const restore = function(btn) {
    document.body.classList.remove("stop-flow")
    btn.closest(".card").querySelector(".back").innerHTML = latestCardContent
}

document.querySelectorAll("p.large").forEach((element, index, array) => {
    element.innerHTML = array.length - index
});


