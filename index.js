// function validFileType(file) {
// 	var fileTypes = [
// 		'image/jpeg',
// 		'image/pjpeg',
// 		'image/png'
// 	];
// 	for (var i = 0; i < fileTypes.length; i++) {
// 		if (file.type === fileTypes[i]) {
// 			return true;
// 		}
// 	}

// 	return false;
// }

// function returnFileSize(number) {
// 	if (number < 1024) {
// 		return number + 'bytes';
// 	} else if (number > 1024 && number < 1048576) {
// 		return (number / 1024).toFixed(1) + 'KB';
// 	} else if (number > 1048576) {
// 		return (number / 1048576).toFixed(1) + 'MB';
// 	}
// }

// function main() {
// 	console.log('main()');
// 	var input = document.querySelector('#files');
// 	var preview = document.querySelector('.preview');
// 	input.addEventListener('change', imagesChanged);

// 	function imagesChanged() {
// 		console.log('imagesChanged()');
// 		while (preview.firstChild) {
// 			preview.removeChild(preview.firstChild);
// 		}

// 		var curFiles = input.files;
// 		if (curFiles.length === 0) {
// 			var para = document.createElement('p');
// 			para.textContent = 'No files currently selected for upload';
// 			preview.appendChild(para);
// 		} else {
// 			var list = document.createElement('ol');
// 			preview.appendChild(list);
// 			for (var i = 0; i < curFiles.length; i++) {
// 				var listItem = document.createElement('li');
// 				var para = document.createElement('p');
// 				if (validFileType(curFiles[i])) {
// 					var tags = ExifReader.load(curFiles[i], { expanded: true });
// 					console.log(tags);
// 					var pre = document.createElement('pre');
// 					var tagsStr = Object.keys(tags).map(key => {
// 						return key + ': ' + tags[key].description + '(' + tags[key].value + ')';
// 					}).join('\n');
// 					pre.textContent = tagsStr;
// 					para.textContent = 'File name ' + curFiles[i].name + ', file size ' + returnFileSize(curFiles[i].size) + '.';
// 					var image = document.createElement('img');
// 					image.src = window.URL.createObjectURL(curFiles[i]);

// 					listItem.appendChild(image);
// 					listItem.appendChild(para);

// 				} else {
// 					para.textContent = 'File name ' + curFiles[i].name + ': Not a valid file type. Update your selection.';
// 					listItem.appendChild(para);
// 				}

// 				list.appendChild(listItem);
// 			}
// 		}
// 	}
// }

function addError(message) {
	var errors = document.getElementById('errors');
	errors.textContent += message + '\n';
};

function clean() {
	var errors = document.getElementById('errors');
	errors.innerHTML = '';

	var images = document.getElementById('images');
	images.innerHTML = '';
};

function addTags(container, tags) {

	delete tags['MakerNote'];
	if (tags['Thumbnail'] && tags['Thumbnail'].image) {
		var thumb = document.createElement('img');
		var label = document.createElement('label');
		label.textContent = 'Image thumbnail';
		thumb.className = 'thumbnail';
		thumb.src = 'data:image/jpg;base64,' + tags['Thumbnail'].base64;
		container.appendChild(label);
		container.appendChild(thumb);
	} else {
		var p = document.createElement('p');
		p.textContent = 'No thumbnail';
		container.appendChild(p);
	}
	var table = document.createElement('table');
	var head = document.createElement('thead');
	var tr = document.createElement('tr');
	head.appendChild(tr);
	var th = document.createElement('th');
	th.textContent = 'Tag name';
	tr.appendChild(th);
	th = document.createElement('th');
	th.textContent = 'Tag description';
	tr.appendChild(th);
	var body = document.createElement('tbody');
	table.appendChild(head);
	table.appendChild(body);
	container.appendChild(table);

	for (name in tags) {
		try {
			if (tags[name].description !== undefined) {
				var row = document.createElement('tr');
				row.innerHTML = '<td>' + name + '</td><td>' + tags[name].description + '</td>';
				if (['Image Height', 'Image Width', 'Orientation'].includes(name))
					row.className = 'highlight';
				body.appendChild(row);
			}
		} catch (e) {
			addError(name + ' ' + e.toString());
		}
	}
}

function addImage(readerEvent) {
	try {
		var tags = ExifReader.load(readerEvent.target.result);
		var imgInfoContainer = document.createElement('div');
		imgInfoContainer.className = 'info-container';
		var images = document.getElementById('images');
		images.appendChild(imgInfoContainer);
		// The MakerNote tag can be really large. Remove it to lower
		// memory usage if you're parsing a lot of files and saving the
		// tags.
		addTags(imgInfoContainer, tags);
	} catch (error) {
		addError(error.toString());
	}
};

(function (window, document) {
	'use strict';

	if (!window.FileReader) {
		alert('Sorry, your web browser does not support the FileReader API.');
		return;
	}

	window.addEventListener('load', function () {
		document.getElementById('files').addEventListener('change', filesChanged, false);
	}, false);

	function filesChanged(event) {
		var files = event.target.files;
		for (var i = 0; i < files.length; i++) {
			var reader = new FileReader();

			clean();

			reader.onload = addImage;
			
			reader.readAsArrayBuffer(files[i]);
		}
	}
})(window, document);