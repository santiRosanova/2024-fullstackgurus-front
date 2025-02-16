export const handleNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const char = e.key;
      if (char === "Backspace" || char === "Delete" || char === "ArrowLeft" || char === "ArrowRight") {
        return;
      }
      if (/^\d$/.test(char)) {
        return;
      }
      if (char === ".") {
        return;
      }
      e.preventDefault();
    };

    export const handleNumberKeyPressWithoutDecimals = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const char = e.key;
        if (char === "Backspace" || char === "Delete" || char === "ArrowLeft" || char === "ArrowRight") {
          return;
        }
        if (/^\d$/.test(char)) {
          return;
        }
        e.preventDefault();
      };