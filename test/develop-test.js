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
    "replace attributes all": function(done) {
      /*:DOC element = <p>
       <img data-ziploader-archive="directory.zip" data-ziploader-filename="access_bus.svg">
       <img data-ziploader-archive="directory.zip" data-ziploader-filename="access_train.svg">
       <img data-ziploader-archive="directory.zip" data-ziploader-filename="access_walk.svg">
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
  }
);
