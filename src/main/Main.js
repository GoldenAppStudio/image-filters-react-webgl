import React, { Component } from "react";
import ImageUploader from "react-images-upload";
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      brightness: 0.0
    };
  }

  imageSelected = (img) => {
    if(img === null || img === undefined) return;
    else {
      const reader = new FileReader();
      reader.readAsDataURL(img);
  
      reader.onload = (e) => {
        this.setState({image: e.target.result})
        this.makeImageBlackAndWhite(e.target.result, this.state.brightness);
      };
    }
  };

  makeImageBlackAndWhite = (img, brightness) => {
    console.log("img: " + img)
    console.log("brightness: " + brightness)
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.src = img;

    image.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.style = "position: absolute; top: 75px; left: 600px; right: 25px; bottom: 15px; margin: auto; border:2px solid black";

      document.body.appendChild(canvas);

      canvas.width = 450;
      canvas.height = 320;

      // get webgl context
      const gl = canvas.getContext("webgl");

      // clear color for canvas
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(1.0, 0.8, 0.1, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // vertex shader source code (glsl)
      const vertShaderSource = `
        attribute vec2 position;

        varying vec2 texCoords;

        void main() {
          texCoords = (position + 1.0) / 2.0;
          texCoords.y = 1.0 - texCoords.y;
          gl_Position = vec4(position, 0, 1.0);
        }
  `;

      // fragment shader source code (glsl)
      const fragShaderSource = `
        precision highp float;

        varying vec2 texCoords;

        uniform sampler2D textureSampler;

        uniform float uBrightness;

        vec4 inverse(vec4 color) {
          return abs(vec4(color.rgb - 1.0, color.a));
        }

        vec4 blackAndWhite(vec4 color) {
          return vec4(vec3(1.0, 1.0, 1.0) * (color.r + color.g + color.b) / 3.0, color.a);
        }

        void main() {
          float brightness = 0.2  + uBrightness;

          vec4 color = texture2D(textureSampler, texCoords);

          color.rgb += brightness;

          gl_FragColor = inverse(color);
          gl_FragColor = blackAndWhite(color);
        }
  `;

      // creating shader
      const vertShader = gl.createShader(gl.VERTEX_SHADER);
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

      // joining shader with shader source
      gl.shaderSource(vertShader, vertShaderSource);
      gl.shaderSource(fragShader, fragShaderSource);

      // compiling shader
      gl.compileShader(vertShader);
      gl.compileShader(fragShader);

      // create a shader program and attach both shader
      const program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);

      // link shader program
      gl.linkProgram(program);

      // get location of brigthness uniform 
      const brightnessUniform = gl.getUniformLocation(program, "uBrightness");

      gl.useProgram(program);
      gl.uniform1f(brightnessUniform, brightness);


      // define vertices
      const vertices = new Float32Array([
        -1,
        -1,
        -1,
        1,
        1,
        1,
        -1,
        -1,
        1,
        1,
        1,
        -1,
      ]);

      // tell glsl how to read data
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, "position");


      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionLocation);

      // creating a texture
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  };

  render() {
    return (
      <Grid container spacing={3}>
      <Grid item xs={6}>
        
        <div>
        <h5 style={{ color: "#ccc" }}>
        Select an image to make it black & white
      </h5>
        <ImageUploader
          className="ImageUploader"
          style={{ width: 500, marginLeft: 70 }}
          fileContainerStyle={{ backgroundColor: "#aaa" }}
          withIcon={true}
          buttonStyles={{ backgroundColor: "#28527a" }}
          withPreview
          onChange={(img) => this.imageSelected(img[0])}
          singleImage={true}
          buttonText="Choose image"
          imgExtension={[".jpg", ".gif", ".png", ".gif", ".jpeg"]}
          maxFileSize={5242880}
        />
        <h5 style={{ color: "#ccc" }}>
          Set brightness of output
        </h5>
        <Slider
          style={{ color: "black", width: 300}}
          defaultValue={0.0}
          aria-labelledby="discrete-slider-small-steps"
          step={0.1}
          min={-0.5}
          onChangeCommitted={(e, value) => {
            this.setState({brigthness: value});
            this.makeImageBlackAndWhite(this.state.image, value)
          }}
          max={0.4}
          valueLabelDisplay="auto"
        />
      </div>
      </Grid>
      <Grid item xs={6}>
        <div>
        <h5 style={{ color: "#ccc" }}>
        Preview will be shown below
      </h5>
        </div>
      </Grid>
      
    </Grid>
      
    );
  }
}
