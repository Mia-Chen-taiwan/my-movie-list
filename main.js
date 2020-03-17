(function () {
  // new variable
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/' //處理圖片檔案
  const data = [] //用來存放 Index API 回傳的 JSON 資料。

  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const switchMode = document.querySelector('.switch-mode')
  const pagination = document.getElementById('pagination')

  const ITEM_PER_PAGE = 12
  let paginationData = []
  let cardMode = true
  let pageNow = 1
  let dataNow =[]

  axios.get(INDEX_URL).then((response) => {

      data.push(...response.data.results)
      //...三個點點 = spread operator => 展開陣列元素
      getTotalPages(data)
      getPageData(1, data)
      dataNow = data
    })
    .catch((err) => console.log(err))
  

  //listen to dataPanel
  dataPanel.addEventListener('click', (event) => {

     if (event.target.matches('.btn-show-movie')){
       showMovie(event.target.dataset.id)

     } else if (event.target.matches('.btn-add-favorite')){
       console.log(event.target.dataset.id)
       addFavoriteItem(event.target.dataset.id)

     }
  })

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    //正規表達式(後面的'i'表示無論大小寫都可)
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    
    getTotalPages(results)
    getPageData(1, results)
    dataNow = results
  })

   // listen to pagination click event
   pagination.addEventListener('click', event => {
    pageNow = event.target.dataset.page
    console.log(pageNow)
    if (event.target.tagName === 'A') {
      getPageData(pageNow)
    }
  })

  //listen to switch bottuns
  switchMode.addEventListener('click', event => {
    if (event.target.matches('#list-view')){
      cardMode = false
      getPageData(pageNow, dataNow)
    } else {
      cardMode = true
      getPageData(pageNow, dataNow)
    }
  })

  function displayCardMode (data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top" src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h6>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">
              More</button> 
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  function displayListMode (data){
    let htmlContent = '<ul class="list-group list-group-flush" style="width:95%">'
    data.forEach(function(item, index){
      htmlContent += `
        <li class="list-group-item d-flex justify-content-between align-items-center mx-3">
          ${item.title} 
          <div>
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">
        More</button> 
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      `
    })
    htmlContent += `</ul>`
    dataPanel.innerHTML = htmlContent
  }

  function showMovie (id){
    //get element
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    //set request url
    const url = INDEX_URL + id
    console.log(url)

    //send request to show api
    axios.get(url).then((response) => {
      const data = response.data.results
      console.log(data)

      //insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    }) 
  }

  function addFavoriteItem(id){
    //local storage 裡的 value 是 string type，也就是存入 data 時需要呼叫 JSON.stringify(obj)，而取出時需要呼叫 JSON.parse(value)
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages (data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData (pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    //判斷要用List還是Card呈現
    if (cardMode == true){
      displayCardMode(pageData)
    } else {
      displayListMode(pageData)
    }
  }

})()