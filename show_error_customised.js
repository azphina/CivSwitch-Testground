(async () => {

    const ShowSystemError = sdk_base + 0x3117d0n;

    const SystermErrorArg = sdk_base + 0x3126d8n;
    const SetErrorCode = sdk_base + 0x31289cn;
    const SetDialogMessage = sdk_base + 0x3128b0n;

    const ShowKeyboard = sdk_base + 0x3e2fa0n;

    const InitializeKeyboardConfig = sdk_base + 0x3e2fb0n;
    const MakePresetDefault = sdk_base + 0x3e2590n;

    const RequiredWorkBuffer = sdk_base + 0x3e31e0n;

    let tempStringBuffer = undefined;

    function prepare_string(str) {
        if (typeof tempStringBuffer != "undefined") {
            free(tempStringBuffer);
        }
        tempStringBuffer = malloc(0x2000)
        const bytes = text_encode(str);

        for (let i = 0; i < bytes.length; i++) {
            write8(tempStringBuffer + BigInt(i), bytes[i]);
        }

        write8(tempStringBuffer + BigInt(bytes.length), 0);
    }

    function show_keyboard(length = 500) {
        const configBufferLength = 0x1000n
        const workBufferLength = call_rop(RequiredWorkBuffer, 0x00n);
        const checkBufferLength = 0x7d4n;
        const dictBufferLength = 0x400n
        const textBufferLength = 0x7d4n;
        const stringBufferLength = 0x7d4n;

        const configBuffer = malloc(configBufferLength)

        const workBuffer = malloc(workBufferLength)
        const checkBuffer = malloc(checkBufferLength)
        const dictBuffer = malloc(dictBufferLength)

        //Initialize the keyboard config
        call_rop(InitializeKeyboardConfig, configBuffer);
        call_rop(MakePresetDefault, configBuffer);

        write32(configBuffer + 0x0n, 0x01n) // Numeric only

        write32(configBuffer + 0x3ACn, 0x08n) //Max Length
        write32(configBuffer + 0x3B0n, 0x08n) // Min Length

        write32(configBuffer + 0x3B8n, 0x02n) // Seperated input

        write32(configBuffer + 0x3E0n, 0x03n) // Input seperation

        //Write needed stuff to become ShowKeyboardArgs
        write64(configBuffer + 0x518n, workBuffer)
        write64(configBuffer + 0x520n, workBufferLength)
        write64(configBuffer + 0x528n, checkBuffer)
        write64(configBuffer + 0x530n, checkBufferLength)
        write64(configBuffer + 0x538n, dictBuffer)
        write64(configBuffer + 0x540n, dictBufferLength)

        const textBuffer = malloc(textBufferLength)
        const stringBuffer = malloc(stringBufferLength)
        write64(stringBuffer, textBuffer)
        write64(stringBuffer + 0x08n, stringBufferLength)

        call_rop(ShowKeyboard, stringBuffer, configBuffer);

        const textBufferArray = read_buffer(textBuffer, textBufferLength).filter(value => value !== 0)
        const ret = String.fromCharCode(...textBufferArray)
        return ret;
    }

    function show_keyboard_2(length = 500) {
        const configBufferLength = 0x1000n
        const workBufferLength = call_rop(RequiredWorkBuffer, 0x00n);
        const checkBufferLength = 0x7d4n;
        const dictBufferLength = 0x400n
        const textBufferLength = 0x7d4n;
        const stringBufferLength = 0x7d4n;

        const configBuffer = malloc(configBufferLength)

        const workBuffer = malloc(workBufferLength)
        const checkBuffer = malloc(checkBufferLength)
        const dictBuffer = malloc(dictBufferLength)

        //Initialize the keyboard config
        call_rop(InitializeKeyboardConfig, configBuffer);
        call_rop(MakePresetDefault, configBuffer);
        write32(configBuffer + 0x3ACn, 0xF0n) //Max Length
        write32(configBuffer + 0x3B0n, 0x1n) // Min Length

        //Write needed stuff to become ShowKeyboardArgs
        write64(configBuffer + 0x518n, workBuffer)
        write64(configBuffer + 0x520n, workBufferLength)
        write64(configBuffer + 0x528n, checkBuffer)
        write64(configBuffer + 0x530n, checkBufferLength)
        write64(configBuffer + 0x538n, dictBuffer)
        write64(configBuffer + 0x540n, dictBufferLength)

        const textBuffer = malloc(textBufferLength)
        const stringBuffer = malloc(stringBufferLength)
        write64(stringBuffer, textBuffer)
        write64(stringBuffer + 0x08n, stringBufferLength)

        call_rop(ShowKeyboard, stringBuffer, configBuffer);

        const textBufferArray = read_buffer(textBuffer, textBufferLength).filter(value => value !== 0)
        const ret = String.fromCharCode(...textBufferArray)
        return ret;
    }

    const msg = show_keyboard_2();
    const message = show_keyboard();

    let arr = message.split("")
    let mid = Math.floor(arr.length / 2)
    let modu = BigInt(arr.slice(0, mid).join(""))
    let description = BigInt(arr.slice(mid).join(""))

    const errarg_buffer = malloc(0x2000n)
    call_rop(SystermErrorArg, errarg_buffer);
    let errorcode = (description << 32n) | (modu & 0xffffffffn);

    call_rop(SetErrorCode, errarg_buffer, errorcode);
    prepare_string(msg)
    call_rop(SetDialogMessage, errarg_buffer, tempStringBuffer);

    const ret = call_rop(ShowSystemError, errarg_buffer);
    free(errarg_buffer);
    free(tempStringBuffer);
    return ret;

})()