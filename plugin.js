/**
 * CKEditor plugin: Dragable image resizing
 * - Shows semi-transparent overlay while resizing
 * - Enforces Aspect Ratio (unless holding shift)
 * - Snap to size of other images in editor
 * - Escape while dragging cancels resize
 *
 */
(function() {
  "use strict";

  var PLUGIN_NAME = 'moveimage';
  var IMAGE_SNAP_TO_SIZE = 7;

  /**
   * Initializes the plugin
   */
  CKEDITOR.plugins.add(PLUGIN_NAME, {
    onLoad: function() {
      CKEDITOR.addCss('img.dragimage{position: relative;}');
    },
    init: function(editor) {
      //onDomReady handler
      editor.on('contentDom', function(evt) {
        init(editor);
      });
    }
  });

  function init(editor) {
    var window = editor.window.$, document = editor.document.$;
    var snapToSize = (typeof IMAGE_SNAP_TO_SIZE === 'undefined') ? null : IMAGE_SNAP_TO_SIZE;

    var mover = new Mover(editor);

    document.addEventListener('mousedown', function(e) {
      if (mover.isMovable(e.target)) {
        mover.startDrag(e);
      }
    }, false);

    document.addEventListener('mouseup', function (e) {
      if (mover.isHandle(e.target)) {
        mover.stopDrag(e);
      }
    }, false);

    editor.on('beforeUndoImage', function () {
      // Remove the handles before undo images are saved
      mover.hide();
    });
    editor.on('blur', function () {
      // Remove the handles when editor loses focus
      mover.hide();
    });
  }

  function Mover(editor) {
    this.editor = editor;
    this.window = editor.window.$;
    this.document = editor.document.$;
    this.init();
  }

  Mover.prototype = {
    init: function() {
      var imageDoms = document.querySelectorAll('img');
      if (imageDoms && imageDoms.length > 0) {
        imageDoms.forEach(function (imageDom){
          imageDom.classList.add('dragimage');
        });
      }
    },
    hide: function() {
      var imageDoms = document.querySelectorAll('img');
      if (imageDoms && imageDoms.length > 0) {
        imageDoms.forEach(function (imageDom) {
          imageDom.classList.remove('dragimage');
        });
      }
    },
    isMovable: function(el) {
      if (el.className == 'dragimage') { 
        return true;
      } else {
        return false;
      }
    },
    startDrag: function(e) {
      this.targ = e.target;

      // calculate event X, Y coordinates
      this.offsetX = e.clientX;
      this.offsetY = e.clientY;

      // assign default values for top and left properties
      if (!this.targ.style.left) { this.targ.style.left = '0px' };
      if (!this.targ.style.top) { this.targ.style.top = '0px' };

      // calculate integer values for top and left 
      // properties
      this.coordX = parseInt(this.targ.style.left);
      this.coordY = parseInt(this.targ.style.top);
      this.drag = true;

      // move div element
      this.document.onmousemove = this.dragImage;
      return false;
    },
    dragImage: function(e) {
      if (!this.drag) { return };
      if (!e) { var e = this.window.event };
      // var targ=e.target?e.target:e.srcElement;
      // move div element
      this.targ.style.left = this.coordX + e.clientX - this.offsetX + 'px';
      this.targ.style.top = this.coordY + e.clientY - this.offsetY + 'px';
      return false;
    },
    stopDrag: function(e) {
      this.drag = false;
    }
  };

})();
