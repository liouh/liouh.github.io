function hasMultipleSolutions({ hintsX, hintsY, height, width, state }) {
    const results = [];

    function generateLineSolutions(hint, length) {
        if (!Array.isArray(hint)) return [];

        if (hint.length === 0) {
            return [Array(length).fill(1)]; // All blanks
        }

        const totalBlocks = hint.reduce((a, b) => a + Math.abs(b), 0);
        const minSpaces = hint.length - 1;

        function helper(index, currentLine, spacesLeft) {
            const result = [];

            if (index >= hint.length || typeof hint[index] !== 'number') {
                return result;
            }

            const blk = Math.abs(hint[index]); // Support negative values
            for (let prefix = 0; prefix <= spacesLeft; prefix++) {
                const newLine = currentLine.concat(Array(prefix).fill(1)); // blanks
                const filled = newLine.concat(Array(blk).fill(2));         // filled blocks

                if (index === hint.length - 1) {
                    const suffix = Array(length - filled.length).fill(1);    // trailing blanks
                    result.push(filled.concat(suffix));
                } else {
                    result.push(
                        ...helper(index + 1, filled.concat([1]), spacesLeft - prefix)
                    );
                }
            }

            return result;
        }

        return helper(0, [], length - (totalBlocks + minSpaces));
    }

    const rowSolutions = hintsX.map(hint => generateLineSolutions(hint, width));

    function matchesState(possibleRow, rowIndex) {
        const current = state[rowIndex];
        if (!current) return true;

        for (let i = 0; i < width; i++) {
            const currentVal = Math.abs(current[i]);
            if (currentVal === 0 || currentVal === null) continue;
            if (currentVal !== possibleRow[i]) return false;
        }

        return true;
    }

    function isValid(grid) {
        for (let col = 0; col < width; col++) {
            const colLine = grid.map(row => row[col]);
            const hint = hintsY[col];
            const parsed = [];
            let index = 0;

            while (index < height) {
                while (index < height && colLine[index] === 1) index++; // Skip blanks
                let count = 0;
                while (index < height && colLine[index] === 2) {
                    count++;
                    index++;
                }
                if (count > 0) parsed.push(count);
            }

            const normalizedHint = hint.map(x => Math.abs(x)); // Normalize hint
            if (JSON.stringify(parsed) !== JSON.stringify(normalizedHint)) return false;
        }

        return true;
    }

    function dfs(row = 0, grid = []) {
        if (row === height) {
            if (isValid(grid)) {
                results.push(JSON.parse(JSON.stringify(grid)));
                if (results.length > 1) return true;
            }
            return false;
        }

        const currentStateRow = state[row];
        const isRowComplete = currentStateRow &&
            !currentStateRow.some(cell => cell === 0 || cell === null || cell === undefined);

        if (isRowComplete) {
            const normalizedRow = currentStateRow.map(cell => Math.abs(cell));
            return dfs(row + 1, [...grid, normalizedRow]);
        }

        for (const possibility of rowSolutions[row]) {
            if (!matchesState(possibility, row)) continue;
            if (dfs(row + 1, [...grid, possibility])) return true;
        }

        return false;
    }

    dfs();
    return results.length > 1;
}

self.onmessage = function (e) {
    const result = hasMultipleSolutions(e.data);
    self.postMessage({
        calculatedSeed: e.data.seed,
        calculatedHeight: e.data.height,
        calculatedWidth: e.data.width,
        result
    });
}
