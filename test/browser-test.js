//-----------------------------------------------------------------------------
// test cases
// zip for test: http://spheresofa.net/blog/?page_id=821
//-----------------------------------------------------------------------------
buster.testCase(
  "ziploader.js",
  {
    //
    // 準備
    //
    setUp: function() {
      this.timeout = 1000;
    },
    //
    // 後片付け。body 以下にあるすべての要素を削除する
    //
    tearDown: function() {
      var body = document.body;
      while (body.length > 0) {
        body.removeChild(body.firstChild);
      }
    },
    //
    // アーカイブの取得とキャッシュ
    //
    "request and cache": function(done) {
      var zl = new ZipLoader();

      // アーカイブの取得
      zl.requestArchive('svg32.zip', function(unzip) {
        // 取得したアーカイブ一覧
        var archives = zl.getArchives();

        // キャッシュされたアーカイブは Zlib.Unzip のインスタンスで引数と同じものか確認
        assert(unzip instanceof Zlib.Unzip, "Zlib.Unzip instance");
        assert(archives['svg32.zip'] === unzip, 'cache');

        done();
      });
    },
    //
    // 適用する要素を一つ渡して適用する
    //
    "replace attributes": function(done) {
      /*:DOC element = <img data-ziploader-archive="svg32.zip" data-ziploader-filename="access_bus.svg"> */
      var image = this.element;
      var haveNaturalWidth = (new Image().naturalWidth !== void 0);
      var zl = new ZipLoader();

      // wait replace attributes
      image.addEventListener('load', function(ev) {
        assert(image.getAttribute('src'));
        refute(image.getAttribute('data-ziploader-archive'));
        refute(image.getAttribute('data-ziploader-filename'));

        // 画像の元のサイズが取れる場合はサイズのアサーションも行う
        if (haveNaturalWidth) {
          assert.equals(image.naturalWidth, 32, 'svg natural width');
          assert.equals(image.naturalHeight, 32, 'svg natural height');
        }
        done();
      }, false);

      zl.applyElement(this.element, 'src');
    },
    //
    // querySelector による該当要素すべてに適用する
    //
    "replace attributes all": function(done) {
      /*:DOC element = <p>
       <img data-ziploader-archive="svg32.zip" data-ziploader-filename="access_bus.svg">
       <img data-ziploader-archive="svg32.zip" data-ziploader-filename="access_train.svg">
       <img data-ziploader-archive="svg32.zip" data-ziploader-filename="access_walk.svg">
       </p>
      */
      document.body.appendChild(this.element);

      var zl = new ZipLoader();
      zl.applyElementAll('img[data-ziploader-archive]', 'src');

      // wait replace attributes
      setTimeout(function() {
        var i;
        var il;
        var images = document.images;
        var image;

        for (i = 0, il = images.length; i < il; ++i) {
          image = images[i];
          assert(image.getAttribute('src'));
          refute(image.getAttribute('data-ziploader-archive'));
          refute(image.getAttribute('data-ziploader-filename'));
        }

        done();
      }, 100);
    },
    //
    // SVG Fallback が有効に機能しているか
    //
    'SVG Fallback': function(done) {
      /*:DOC element = <p>
       <img data-ziploader-archive="png32.zip" data-ziploader-filename="access_bus.svg">
       <img data-ziploader-archive="png32.zip" data-ziploader-filename="access_train.svg">
       <img data-ziploader-archive="png32.zip" data-ziploader-filename="access_walk.svg">
       </p>
       */
      document.body.appendChild(this.element);

      // SVGElement を殺して png のみの zip からの読み込みが成功するか
      var tmp = window.SVGElement;
      try {
        window.SVGElement = void 0;

        var zl = new ZipLoader();
        zl.applyElementAll('img[data-ziploader-archive]', 'src');
      } finally {
        window.SVGElement = tmp;
      }

      // wait replace attributes
      setTimeout(function() {
        var i;
        var il;
        var images = document.images;
        var image;

        for (i = 0, il = images.length; i < il; ++i) {
          image = images[i];
          assert(image.getAttribute('src'));
          refute(image.getAttribute('data-ziploader-archive'));
          refute(image.getAttribute('data-ziploader-filename'));
        }

        done();
      }, 100);
    }
  }
);

