const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},

  songs: [
    {
      name: "Spring Day",
      singer: "BTS",
      path: "./assets/music/springday.mp3",
      image: "./assets/images/springday.jpg",
    },
    {
      name: "Euphoria",
      singer: "Jungkook",
      path: "./assets/music/euphoria.mp3",
      image: "./assets/images/euphoria.jpg",
    },
    {
      name: "Em Mới Là Người Yêu Anh",
      singer: "Min",
      path: "./assets/music/em_moi_la_nguoi_yeu_anh.mp3",
      image: "./assets/images/emmoilanyanh.jpg",
    },
    {
      name: "Một Nhà",
      singer: "Da Lab",
      path: "./assets/music/mot_nha.mp3",
      image: "./assets/images/motnha.jpg",
    },
    {
      name: "Sweet Night",
      singer: "V",
      path: "./assets/music/sweetnight.mp3",
      image: "./assets/images/sweetnight.jpg",
    },
    {
      name: "Nàng Thơ",
      singer: "Hoàng Dũng",
      path: "./assets/music/nang_tho.mp3",
      image: "./assets/images/nangtho.jpg",
    },
    {
      name: "Có Hẹn Với Thanh Xuân",
      singer: "Monstar",
      path: "./assets/music/co_hen_voi_thanh_xuan.mp3",
      image: "./assets/images/cohenvoithanhxuan.jpg",
    },
    {
      name: "Let Somebody Go",
      singer: "Coldplay X Selena Gomes",
      path: "./assets/music/letsomebodygo.mp3",
      image: "./assets/images/letsomebodygo.jpg",
    },
    {
      name: "Christmas Tree",
      singer: "V",
      path: "./assets/music/christmastree.mp3",
      image: "./assets/images/1644402723076_640.jpg",
    },
    {
      name: "Thằng Điên",
      singer: "Justatee & Phương Ly",
      path: "./assets/music/thang_dien.mp3",
      image: "./assets/images/thangdien.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song,index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="
                background-image: url('${song.image}');
                "></div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
        `;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // xử lí đĩa cd quay

    const cdThumbAnimate = cdThumb.animate([{transform:"rotate(360deg)"}], {
      duration: 10000, // 10s
      iterations: Infinity //loop vo han
    });
    cdThumbAnimate.pause()


    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // xu li khi click play button
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // tiến độ thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // khi next song
    nextBtn.onclick = function(e) {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else{
        _this.nextSong();
      } 
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
      
    }
    
    // khi prev song
    prevBtn.onclick = function(e) {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong(); 
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    }

    // khi xử lí bật tắt random
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };


    repeatBtn.onclick = function(){
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // khi end bai hat
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      }
      else nextBtn.click();
    };


    playlist.onclick = function(e){
      // xu li khi click vao song
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option") ) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    }
  },


  scrollToActiveSong: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    },300)
  },


  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  // khi next song
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  // khi prev song
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  //random song
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex =  Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex )
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    this.loadConfig();
    // Định nghĩa các thuộc tính cho object
    this.defineProperties();
    // lắng nghe xử lí các sự kiện
    this.handleEvents();
    // tải bài đầu tiên khi mới chạy
    this.loadCurrentSong();
    // render playlist
    this.render();

    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();

// 44:35

  