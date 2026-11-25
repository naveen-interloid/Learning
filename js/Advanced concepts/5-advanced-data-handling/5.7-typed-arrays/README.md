# Typed Arrays & ArrayBuffer

Typed arrays provide a way to work with binary data in JavaScript, offering better performance for numerical computations and interoperability with native APIs.

## ArrayBuffer

ArrayBuffer represents a fixed-length raw binary data buffer.

```javascript
// Create a 16-byte buffer
const buffer = new ArrayBuffer(16);
console.log(buffer.byteLength); // 16

// ArrayBuffers are not directly readable
console.log(buffer[0]); // undefined

// Check if transferable (for Web Workers)
console.log(buffer instanceof ArrayBuffer); // true
```

## DataView

DataView provides a flexible interface for reading and writing multiple number types in an ArrayBuffer.

```javascript
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);

// Write different types at different offsets
view.setInt8(0, 42);           // 1 byte at offset 0
view.setInt16(1, 1000);        // 2 bytes at offset 1
view.setInt32(4, 100000);      // 4 bytes at offset 4
view.setFloat32(8, 3.14);      // 4 bytes at offset 8
view.setFloat64(12, 2.718);    // 8 bytes at offset 12 (but only 4 bytes left!)

// Read the values back
console.log(view.getInt8(0));     // 42
console.log(view.getInt16(1));    // 1000
console.log(view.getInt32(4));    // 100000
console.log(view.getFloat32(8));  // 3.140000104904175 (float precision)
```

### Endianness

```javascript
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

// Write a 32-bit integer
view.setInt32(0, 0x12345678);

// Read as big-endian (default)
console.log(view.getInt32(0, false).toString(16)); // 12345678

// Read as little-endian
console.log(view.getInt32(0, true).toString(16)); // 78563412

// Check system endianness
function getEndianness() {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setInt16(0, 0x1234);
    return view.getInt8(0) === 0x12 ? 'big' : 'little';
}

console.log('System endianness:', getEndianness());
```

## Typed Array Types

### Integer Types

```javascript
// 8-bit integers
const int8 = new Int8Array(4);        // -128 to 127
const uint8 = new Uint8Array(4);      // 0 to 255
const uint8Clamped = new Uint8ClampedArray(4); // 0 to 255 (clamped)

// 16-bit integers
const int16 = new Int16Array(4);      // -32,768 to 32,767
const uint16 = new Uint16Array(4);    // 0 to 65,535

// 32-bit integers
const int32 = new Int32Array(4);      // -2^31 to 2^31-1
const uint32 = new Uint32Array(4);    // 0 to 2^32-1

// 64-bit integers (BigInt)
const bigInt64 = new BigInt64Array(4);   // -2^63 to 2^63-1
const bigUint64 = new BigUint64Array(4); // 0 to 2^64-1
```

### Floating Point Types

```javascript
// 32-bit floating point
const float32 = new Float32Array(4);  // IEEE 754 single precision

// 64-bit floating point
const float64 = new Float64Array(4);  // IEEE 754 double precision

// Example usage
float32[0] = 3.14159;
float64[0] = 3.14159;

console.log(float32[0]); // 3.1415927410125732 (less precision)
console.log(float64[0]); // 3.14159 (full precision)
```

## Creating Typed Arrays

### From ArrayBuffer

```javascript
const buffer = new ArrayBuffer(16);

// Create views of the same buffer
const int32View = new Int32Array(buffer);      // 4 elements (16/4)
const int16View = new Int16Array(buffer);      // 8 elements (16/2)
const int8View = new Int8Array(buffer);        // 16 elements (16/1)

// Modify through one view
int32View[0] = 0x12345678;

// See changes in other views
console.log(int16View[0], int16View[1]); // Depends on endianness
console.log(int8View[0], int8View[1], int8View[2], int8View[3]);
```

### From Arrays

```javascript
// From regular array
const regularArray = [1, 2, 3, 4, 5];
const typedArray = new Int32Array(regularArray);

// From another typed array
const float32Array = new Float32Array(typedArray);

// Using Array.from
const fromRange = Int32Array.from({length: 5}, (_, i) => i * 2);
console.log(fromRange); // [0, 2, 4, 6, 8]
```

### With Initial Values

```javascript
// Direct initialization
const direct = new Int32Array([10, 20, 30, 40]);

// Using of() method
const using_of = Int32Array.of(1, 2, 3, 4, 5);

// Pre-filled with specific value
const filled = new Float32Array(5).fill(3.14);
```

## Performance Benefits

### Numerical Computations

```javascript
function performanceComparison() {
    const size = 1000000;
    const iterations = 100;
    
    // Regular array
    const regularArray = new Array(size).fill(0).map((_, i) => i);
    
    // Typed array
    const typedArray = new Float64Array(size);
    for (let i = 0; i < size; i++) {
        typedArray[i] = i;
    }
    
    // Test regular array performance
    console.time('Regular Array Math');
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < size; i++) {
            regularArray[i] = Math.sqrt(regularArray[i]) * 2.5;
        }
    }
    console.timeEnd('Regular Array Math');
    
    // Test typed array performance
    console.time('Typed Array Math');
    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < size; i++) {
            typedArray[i] = Math.sqrt(typedArray[i]) * 2.5;
        }
    }
    console.timeEnd('Typed Array Math');
}
```

### Memory Efficiency

```javascript
function memoryComparison() {
    const size = 1000000;
    
    // Regular array (each element is a JavaScript value)
    const regularArray = new Array(size);
    for (let i = 0; i < size; i++) {
        regularArray[i] = i;
    }
    
    // Typed array (packed binary data)
    const typedArray = new Int32Array(size);
    for (let i = 0; i < size; i++) {
        typedArray[i] = i;
    }
    
    console.log('Regular array length:', regularArray.length);
    console.log('Typed array length:', typedArray.length);
    console.log('Typed array byte length:', typedArray.byteLength);
    console.log('Bytes per element:', typedArray.BYTES_PER_ELEMENT);
}
```

## Advanced Patterns

### Binary Data Processing

```javascript
class BinaryDataProcessor {
    static readBinaryFile(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const result = {
            header: {},
            data: []
        };
        
        // Read header (first 16 bytes)
        result.header.magic = view.getUint32(0);
        result.header.version = view.getUint16(4);
        result.header.flags = view.getUint16(6);
        result.header.dataLength = view.getUint32(8);
        result.header.checksum = view.getUint32(12);
        
        // Read data section
        const dataStart = 16;
        const dataArray = new Uint8Array(arrayBuffer, dataStart);
        result.data = Array.from(dataArray);
        
        return result;
    }
    
    static createBinaryFile(data) {
        const headerSize = 16;
        const buffer = new ArrayBuffer(headerSize + data.length);
        const view = new DataView(buffer);
        
        // Write header
        view.setUint32(0, 0x12345678);  // Magic number
        view.setUint16(4, 1);           // Version
        view.setUint16(6, 0);           // Flags
        view.setUint32(8, data.length); // Data length
        view.setUint32(12, 0);          // Checksum (simplified)
        
        // Write data
        const dataArray = new Uint8Array(buffer, headerSize);
        dataArray.set(data);
        
        return buffer;
    }
}
```

### Image Data Manipulation

```javascript
class ImageProcessor {
    static createGrayscaleFilter(imageData) {
        const data = new Uint8ClampedArray(imageData.data);
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate grayscale value
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            data[i] = gray;     // Red
            data[i + 1] = gray; // Green
            data[i + 2] = gray; // Blue
            // Alpha channel (i + 3) remains unchanged
        }
        
        return new ImageData(data, imageData.width, imageData.height);
    }
    
    static adjustBrightness(imageData, factor) {
        const data = new Uint8ClampedArray(imageData.data);
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
            data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
            // Alpha channel remains unchanged
        }
        
        return new ImageData(data, imageData.width, imageData.height);
    }
}
```

### Audio Data Processing

```javascript
class AudioProcessor {
    static generateSineWave(frequency, duration, sampleRate = 44100) {
        const samples = duration * sampleRate;
        const buffer = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const time = i / sampleRate;
            buffer[i] = Math.sin(2 * Math.PI * frequency * time);
        }
        
        return buffer;
    }
    
    static applyGain(audioBuffer, gainValue) {
        const output = new Float32Array(audioBuffer.length);
        
        for (let i = 0; i < audioBuffer.length; i++) {
            output[i] = audioBuffer[i] * gainValue;
            
            // Clamp to prevent distortion
            if (output[i] > 1.0) output[i] = 1.0;
            if (output[i] < -1.0) output[i] = -1.0;
        }
        
        return output;
    }
    
    static mixAudio(buffer1, buffer2, ratio = 0.5) {
        const length = Math.min(buffer1.length, buffer2.length);
        const output = new Float32Array(length);
        
        for (let i = 0; i < length; i++) {
            output[i] = buffer1[i] * ratio + buffer2[i] * (1 - ratio);
        }
        
        return output;
    }
}
```

## Interoperability with Web APIs

### Canvas Integration

```javascript
function processCanvasData(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // imageData.data is a Uint8ClampedArray
    const pixels = imageData.data;
    
    // Process pixels directly
    for (let i = 0; i < pixels.length; i += 4) {
        // Invert colors
        pixels[i] = 255 - pixels[i];         // Red
        pixels[i + 1] = 255 - pixels[i + 1]; // Green
        pixels[i + 2] = 255 - pixels[i + 2]; // Blue
        // Alpha remains the same
    }
    
    // Put processed data back
    ctx.putImageData(imageData, 0, 0);
}
```

### Web Audio API

```javascript
class WebAudioProcessor {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }
    
    createBufferFromTypedArray(typedArray, sampleRate = 44100) {
        const buffer = this.audioContext.createBuffer(
            1, // mono
            typedArray.length,
            sampleRate
        );
        
        // Copy data to AudioBuffer
        buffer.copyToChannel(typedArray, 0);
        return buffer;
    }
    
    processAudioBuffer(audioBuffer, processFn) {
        const channelData = audioBuffer.getChannelData(0);
        
        // channelData is a Float32Array
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] = processFn(channelData[i], i);
        }
        
        return audioBuffer;
    }
}
```

### File API Integration

```javascript
class FileProcessor {
    static async readAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    static async processImageFile(file) {
        const arrayBuffer = await this.readAsArrayBuffer(file);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check file signature (JPEG starts with FF D8)
        if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
            console.log('JPEG file detected');
            return this.processJPEG(uint8Array);
        }
        
        // Check PNG signature
        const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        const isPNG = pngSignature.every((byte, i) => uint8Array[i] === byte);
        
        if (isPNG) {
            console.log('PNG file detected');
            return this.processPNG(uint8Array);
        }
        
        throw new Error('Unsupported file format');
    }
}
```

## Best Practices

1. **Choose the right type** - Use the smallest type that fits your data range
2. **Consider endianness** - Be explicit about byte order when needed
3. **Use DataView for mixed data** - When working with different types in the same buffer
4. **Leverage performance benefits** - For numerical computations and large datasets
5. **Handle overflow/underflow** - Typed arrays have fixed ranges
6. **Use for binary protocols** - Network protocols, file formats, etc.
7. **Consider memory alignment** - Some operations are faster with aligned data

## Common Use Cases

- Image and audio processing
- Binary file format parsing
- Network protocol implementation
- Mathematical computations
- Game development (graphics, physics)
- Cryptographic operations
- Data visualization
- Scientific computing
- WebGL applications
- Web Workers data transfer
