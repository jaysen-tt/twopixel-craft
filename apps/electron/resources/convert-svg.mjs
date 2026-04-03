import sharp from 'sharp';

async function convert() {
    await sharp('icon.svg')
        .resize(1024, 1024)
        .png()
        .toFile('source.png');
    console.log('Converted icon.svg to source.png');
}

convert().catch(console.error);