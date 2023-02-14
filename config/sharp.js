const sharp = require('sharp');
const path = require('path');

const SMALL_WIDTH_SIZE = 100;
const THUMBNAIL_WIDTH_SIZE = 300;
const LARGE_WIDTH_SIZE = 600;
const SMALL_HEIGHT_SIZE = 100;
const THUMBNAIL_HEIGHT_SIZE = 300;
const LARGE_HEIGHT_SIZE = 600;
const ROOT_PATH = './uploads/';

const flow = [{ path: 'small', width: SMALL_WIDTH_SIZE, height: SMALL_HEIGHT_SIZE },
{ path: 'thumbnail', width: THUMBNAIL_WIDTH_SIZE, height: THUMBNAIL_HEIGHT_SIZE },
{ path: 'large', width: LARGE_WIDTH_SIZE, height: LARGE_HEIGHT_SIZE }];

function createThumbnail(file, desn, MAX_WIDTH_SIZE, MAX_HEIGHT_SIZE) {
  const filePath = path.join(__dirname, '/../' + file);
  console.log(path.join(__dirname, '/../' + desn));
  sharp(filePath)
  .rotate()
  .resize(MAX_WIDTH_SIZE, MAX_HEIGHT_SIZE)
  .max()  
  .toFile(path.join(__dirname, '/../' + desn), (err) => {
    if(err) {
      console.log('Error in image converted', err);
    } else {
      console.log('Image converted');
    }
  });
}

module.exports.resizeImage = function(file) {
  console.log(file);
  for (let i = 0; i < 3; i ++) {
    createThumbnail(file.image.file, `${ROOT_PATH}${file.image.uuid}/image/${flow[i].path}_${file.image.filename}`,
    flow[i].width, flow[i].height);
  }
};
