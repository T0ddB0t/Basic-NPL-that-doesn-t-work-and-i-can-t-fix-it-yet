//this doesn't work
const loadMetaData = async () => {
    const metadata = await fetch(
        `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json`
    );
    return metadata.json();
};

const loadModel = async () => {
    const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json`;
    const model = await tf.loadLayersModel(url);
    return model;
};

const padSequence = (sequences , metadata ) => {
    return sequences.map((seq) => {
        if(seq.length > metadata.max_len){
            seq.splice(0, seq.length - metadata.max_len);
        }
        if(seq.length < metadata.max_len){
            const pad = [];
            for(let i = 0; i < metadata.max_len - seq.length; ++i){
                pad.push(0);
            }
            seq = pad.concat(seq);
        }
        console.log(seq);
    });
};

const predict = (text, model, metadata) =>{
    const trimmed = text 
        .trim()
        .toLowerCase()
        .replace(/(\.|\,|\!|\?)/g, " ")
        .split(" ");
    const sequences = trimmed.map((word) => {
        const wordIndex = metadata.word_index[word];
        if(typeof wordIndex === "undefined") {
            return 2; //oov_index
        }
        return wordIndex + metadata.index_from;
    });
    const paddedSequence = padSequence([sequences], metadata);
    const input = tf.tensor2d(padSequence [1, metadata.max_len]);

    const predictOut = model.predict(input);
    const score = predictOut.dataSync()[0];
    predictOut.dispose();
    return score;
};

const getSentiment = (score) => {
        if(score > 0.66){
            console.log(`score of ${score}: Positive`);
        }
        else if(score > 0.4){
            console.log(`score of ${score}: Neutral`);
        }
        else{
            console.log(`score of ${score}: Negative`);
        }
};
const run = async (text) => {
    const model = await loadModel();
    let sum = 0;
    text.forEach(function (prediction) {
        perc = predict(prediction, model, metadata);
        sum += parseFloat(perc, 10);
    });
    console.log(getSentiment(sum / text.length));
};

window.onload = () => {
    const inputText = document.getElementsByTagName("input")[0];
    const button = document.getElementsByTagName("button")[0];
    button.onclick = () => {
        run([inputText.value]);
    };
};
