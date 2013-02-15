goog.provide('ZipLoader');
goog.require('Zlib.Unzip');

goog.scope(function() {

/**
 * @constructor
 * @param {Object=} opt_params option parameters.
 */
ZipLoader = function(opt_params) {
  opt_params = opt_params || {};
  /** @type {boolean} */
  this.svgFallback =
    opt_params['SVGFallback'] !== void 0 ? opt_params['SVGFallback'] : true;
};

/** @define {boolean} */
ZipLoader.Develop = false;

/** @define {string} */
ZipLoader.AttributePrefix = 'ziploader';

/** @define {string} */
ZipLoader.ArchiveAttribute = 'archive';

/** @define {string} */
ZipLoader.FilenameAttribute = 'filename';

/** @type {string} @const */
ZipLoader.ArchiveAttributeString =
  'data-' + ZipLoader.AttributePrefix + '-'+ ZipLoader.ArchiveAttribute;

/** @type {string} @const */
ZipLoader.FilenameAttributeString =
  'data-' + ZipLoader.AttributePrefix + '-'+ ZipLoader.FilenameAttribute;

/** @type {Object.<string, Zlib.Unzip>} */
ZipLoader.archives = {};

/**
 * @return {Object.<string, Zlib.Unzip>}
 */
ZipLoader.prototype.getArchives = function() {
  return ZipLoader.archives;
};

ZipLoader.prototype.setSVGFallback = function(enable) {
  this.svgFallback = enable;
};

/**
 * @param {string} query query selector string.
 * @param {string} attribute replace target attribute.
 */
ZipLoader.prototype.applyElementAll = function(query, attribute) {
  /** @type {NodeList} */
  var images = document.querySelectorAll(query);
  /** @type {number} */
  var i;
  /** @type {number} */
  var il;

  for (i = 0, il = images.length; i < il; ++i) {
    this.applyElement(/** @type {HTMLImageElement} */(images[i]), attribute);
  }
};

/**
 * @param {HTMLImageElement} image target element.
 * @param {string} attribute replace target attribute.
 */
ZipLoader.prototype.applyElement = function(image, attribute) {
  /** @type {ZipLoader} */
  var that = this;
  /** @type {string} */
  var archive = image.getAttribute(ZipLoader.ArchiveAttributeString);
  /** @type {string} */
  var filename = image.getAttribute(ZipLoader.FilenameAttributeString);

  if (!archive || !filename) {
    return;
  }

  // SVG Fallback
  if (
    this.svgFallback &&
    goog.global['SVGElement'] === void 0 &&
    filename.substr(-4, 4) === '.svg'
  ) {
    filename = filename.substr(0, filename.length - 3) + 'png';
  }

  // zip アーカイブがまだ受信できていなかったらダウンロードしてから置き換える
  if (!ZipLoader.archives[archive] && !ZipLoader.Develop) {
    this.requestArchive(archive, function() {
      applyElement(image, attribute, archive, filename);
    });
  } else {
    applyElement(image, attribute, archive, filename);
  }

  /**
   * @param {HTMLImageElement} img target element.
   * @param {string} attribute replace target attribute.
   * @param {string} archive PKZIP archive url.
   * @param {string} filename extract filename.
   */
  function applyElement(img, attribute, archive, filename) {
    img.setAttribute(
      attribute,
      ZipLoader.Develop ?
        archive + '/' + filename :
        that.createObjectURL(
          ZipLoader.archives[archive].decompress(filename),
          filename.substr(-4, 4) === '.png' ? 'image/png' : 'image/svg+xml'
        )
    );
    img.removeAttribute(ZipLoader.ArchiveAttributeString);
    img.removeAttribute(ZipLoader.FilenameAttributeString);
  }
};

/**
 * @param {(Array.<number>|Uint8Array)} array data.
 * @param {string} type MIME type string.
 * @return {string}
 */
ZipLoader.prototype.createObjectURL = function(array, type) {
  /** @type {Window} */
  var g = goog.global;
  /** @type {*} */
  var tmp;
  /** @type {*} TODO */
  var bb;
  /** @type {Blob} */
  var blob;
  /** @type {boolean} @const */
  var useTypedArray = (typeof Uint8Array !== 'undefined');
  /** @type {string} */
  var data = '';
  /** @type {number} */
  var i;
  /** @type {number} */
  var il;
  /** @type {boolean} */
  var isSafari = (
    navigator.userAgent.indexOf('Safari') !== -1 &&
    navigator.vendor.indexOf('Apple')     !== -1
  );

  if (useTypedArray) {
    array = new Uint8Array(array);
  }

  // avoid blob url in safari
  if (!isSafari) {

    // Blob constructor
    try {
      blob = new Blob([array], {type: type});
    } catch(e) {
    }

    // BlobBuilder
    if (
      (tmp = g.WebkitBlobBuilder) !== void 0 ||
      (tmp = g.MozBlobBuilder) !== void 0 ||
      (tmp = g.MSBlobBuilder) !== void 0
    ) {
      bb = new tmp();
      bb.append(array.buffer);
      blob = bb.getBlob(type);
    }

    // createObjectURL
    if (blob && (
      ((tmp = g.URL)       && tmp.createObjectURL) ||
      ((tmp = g.webkitURL) && tmp.createObjectURL)
    )) {
      return tmp.createObjectURL(blob);
    }
  }

  // DataURL
  for (i = 0, il = array.length; i < il;) {
    data += String.fromCharCode.apply(
      null,
      useTypedArray ?
        array.subarray(i, i+= 0x7fff) :
        array.slice(i, i += 0x7fff)
    );
  }

  return 'data:' + type + ';base64,'+ window.btoa(data);
};

/**
 * @param {string} archiveURL
 * @param {Function} callback
 */
ZipLoader.prototype.requestArchive = function(archiveURL, callback) {
  /** @type {XMLHttpRequest} */
  var xhr = new XMLHttpRequest();

  xhr.open('GET', archiveURL, true);
  xhr.responseType = 'arraybuffer';
  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  xhr.addEventListener('readystatechange', onload, false);
  xhr.addEventListener('error', onerror, false);
  xhr.send();

  function onload() {
    /** @type {Zlib.Unzip} */
    var zip;
    /** @type {!(Array.<number>|Uint8Array)} */
    var buffer;

    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        // arraybuffer
        buffer = this.response ?
          new Uint8Array(this.response) :
          str2array(xhr.responseText);

        // set zip archive
        zip = new Zlib.Unzip(buffer);

        // cache
        ZipLoader.archives[archiveURL] = zip;

        // callback
        callback(zip);
      } else {
        onerror.apply(this, arguments);
      }
    }
  }
  function onerror() {
    if (goog.global.console) {
      goog.global.console.error('archive download error:' + archiveURL);
    }
  }
  /**
   * @param {string} str bytestring.
   * @return {!(Array.<number>|Uint8Array)} bytearray.
   */
  function str2array(str) {
    /** @type {number} */
    var i;
    /** @type {number} */
    var il = str.length;
    /** @type {!(Array.<number>|Uint8Array)} */
    var array =
      new (typeof Uint8Array !== 'undefined' ? Uint8Array : Array)(il);

    for (i = 0; i < il; ++i) {
      array[i] = str.charCodeAt(i) & 0xff;
    }

    return array;
  }
}

});
