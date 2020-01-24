import React, { useState } from "react";
import axios from "axios";

function App() {
  const [img, setImg] = useState("");
  const onChangeHandler = async event => {
    const file = event.target.files[0];

    const defaultExt = "jpg";

    console.log("The file: ", file);

    const { data: signedData } = await axios.get(
      `http://localhost:5000/sign?file-name=${file.name}&file-ext=${defaultExt}`
    );

    const { presignedURL, url } = signedData;

    await axios.put(presignedURL, file);

    setImg(url);
    console.log("Image uploaded :)");
  };
  return (
    <div className="App">
      <input
        type="file"
        name="file"
        onChange={onChangeHandler}
      />
      <img src={img} alt="not uploaded yet"></img>
    </div>
  );
}

export default App;
