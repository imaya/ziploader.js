//-----------------------------------------------------------------------------
// test cases
//-----------------------------------------------------------------------------
buster.testCase(
  "ziploader.js",
  {
    //
    // 準備
    //
    setUp: function() {
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
      /*:DOC element = <img data-archive="svg32.zip" data-filename="access_bus.svg"> */
      var image = this.element;
      var haveNaturalWidth = (new Image().naturalWidth !== void 0);
      var zl = new ZipLoader();
      zl.applyElement(this.element, 'src');

      // wait replace attributes
      setTimeout(function() {
        assert(image.getAttribute('src'));
        refute(image.getAttribute('data-archive'));
        refute(image.getAttribute('data-filename'));

        // 画像の元のサイズが取れる場合はサイズのアサーションも行う
        if (haveNaturalWidth) {
          assert.equals(image.naturalWidth, 32, 'svg natural width');
          assert.equals(image.naturalHeight, 32, 'svg natural height');
        }
        done();
      }, 100);
    },
    //
    // querySelector による該当要素すべてに適用する
    //
    "replace attributes all": function(done) {
      /*:DOC element = <p>
       <img data-archive="svg32.zip" data-filename="access_bus.svg">
       <img data-archive="svg32.zip" data-filename="access_train.svg">
       <img data-archive="svg32.zip" data-filename="access_walk.svg">
       </p>
      */
      document.body.appendChild(this.element);

      var zl = new ZipLoader();
      zl.applyElementAll('img[data-archive]', 'src');

      // wait replace attributes
      setTimeout(function() {
        var i;
        var il;
        var images = document.images;
        var image;

        for (i = 0, il = images.length; i < il; ++i) {
          image = images[i];
          assert(image.getAttribute('src'));
          refute(image.getAttribute('data-archive'));
          refute(image.getAttribute('data-filename'));
        }

        done();
      }, 100);
    }
  }
);

