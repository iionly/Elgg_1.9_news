/**
 * Save draft through ajax
 *
 * @package News
 */

define(function(require) {
	var $ = require('jquery');
	var elgg = require('elgg');

	function saveDraftCallback(data, textStatus, XHR) {
		if (textStatus == 'success' && data.success == true) {
			var form = $('form[id=news-post-edit]');

			// update the guid input element for new posts that now have a guid
			form.find('input[name=guid]').val(data.guid);

			oldDescription = form.find('textarea[name=description]').val();

			var d = new Date();
			var mins = d.getMinutes() + '';
			if (mins.length == 1) {
				mins = '0' + mins;
			}
			$(".news-save-status-time").html(d.toLocaleDateString() + " @ " + d.getHours() + ":" + mins);
		} else {
			$(".news-save-status-time").html(elgg.echo('error'));
		}
	};

	function saveDraft() {
		if (typeof(tinyMCE) != 'undefined') {
			tinyMCE.triggerSave();
		}

		// only save on changed content
		var form = $('form[id=news-post-edit]');
		var description = form.find('textarea[name=description]').val();
		var title = form.find('input[name=title]').val();

		if (!(description && title) || (description == oldDescription)) {
			return false;
		}

		var draftURL = elgg.config.wwwroot + "action/news/auto_save_revision";
		var postData = form.serializeArray();

		// force draft status
		$(postData).each(function(i, e) {
			if (e.name == 'status') {
				e.value = 'draft';
			}
		});

		$.post(draftURL, postData, saveDraftCallback, 'json');
	};

	function init() {
		// get a copy of the body to compare for auto save
		oldDescription = $('form[id=news-post-edit]').find('textarea[name=description]').val();

		setInterval(saveDraft, 60000);
	};

	init();

	return {
		saveDraft: saveDraft
	};
});