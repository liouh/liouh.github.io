function hasMultipleSolutions({ hintsX, hintsY, height, width, state }) {
    const results = [];

    // Parse column hints to absolute values
    const colHintsAbs = hintsY.map(hint => hint.map(Math.abs));

    // Map each cell in state to 0 (unknown), 1 (blank), or 2 (filled)
    const normalizedState = [];
    for (let r = 0; r < height; r++) {
        normalizedState[r] = [];
        for (let c = 0; c < width; c++) {
            const val = state[r] ? state[r][c] : 0;
            if (val === 0 || val === null || val === undefined) {
                normalizedState[r][c] = 0;
            } else {
                normalizedState[r][c] = Math.abs(val); // 1 or 2
            }
        }
    }

    // State-aware line solutions generator
    function generateLineSolutions(hint, length, knownRow) {
        if (!Array.isArray(hint)) return [];

        const normalizedHint = hint.map(Math.abs);
        if (normalizedHint.length === 0) {
            // Check if knownRow is compatible with all blanks
            for (let i = 0; i < length; i++) {
                if (knownRow[i] === 2) return []; // Cannot have filled cells
            }
            return [Array(length).fill(1)];
        }

        const totalBlocks = normalizedHint.reduce((a, b) => a + b, 0);
        const minSpaces = normalizedHint.length - 1;

        function helper(index, startIdx, spacesLeft) {
            const result = [];
            const blk = normalizedHint[index];

            for (let prefix = 0; prefix <= spacesLeft; prefix++) {
                let ok = true;
                // Check if we can place 'prefix' blanks (1s)
                for (let i = 0; i < prefix; i++) {
                    if (knownRow[startIdx + i] === 2) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) continue;

                // Check if we can place 'blk' filled cells (2s)
                for (let i = 0; i < blk; i++) {
                    if (knownRow[startIdx + prefix + i] === 1) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) continue;

                // Check if we can place separator blank (1) if not the last block
                if (index < normalizedHint.length - 1) {
                    if (knownRow[startIdx + prefix + blk] === 2) {
                        ok = false;
                    }
                }
                if (!ok) continue;

                // Construct segment
                const segment = Array(prefix).fill(1).concat(Array(blk).fill(2));

                if (index === normalizedHint.length - 1) {
                    // Suffix blanks
                    const suffixCount = length - (startIdx + prefix + blk);
                    for (let i = 0; i < suffixCount; i++) {
                        if (knownRow[startIdx + prefix + blk + i] === 2) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) {
                        result.push(segment.concat(Array(suffixCount).fill(1)));
                    }
                } else {
                    const subResults = helper(index + 1, startIdx + prefix + blk + 1, spacesLeft - prefix);
                    for (const sub of subResults) {
                        result.push(segment.concat([1], sub));
                    }
                }
            }

            return result;
        }

        return helper(0, 0, length - (totalBlocks + minSpaces));
    }

    const rowSolutions = [];
    for (let r = 0; r < height; r++) {
        rowSolutions[r] = generateLineSolutions(hintsX[r], width, normalizedState[r]);
        // If any row has 0 solutions matching the state, we cannot solve it at all.
        if (rowSolutions[r].length === 0) {
            return false;
        }
    }

    // Helper to check if a column is prefix-valid
    function isColPrefixValid(col, currentHeight, grid) {
        const colHint = colHintsAbs[col];
        const k = colHint.length;

        let m = 0;
        let currentBlock = 0;
        let lastElementIsFilled = false;

        for (let r = 0; r < currentHeight; r++) {
            const val = grid[r][col];
            if (val === 2) {
                currentBlock++;
                lastElementIsFilled = true;
            } else {
                if (currentBlock > 0) {
                    m++;
                    if (m > k) return false;
                    if (currentBlock !== colHint[m - 1]) return false;
                    currentBlock = 0;
                }
                lastElementIsFilled = false;
            }
        }

        if (currentBlock > 0) {
            m++;
            if (m > k) return false;
            if (lastElementIsFilled) {
                if (currentBlock > colHint[m - 1]) return false;
            } else {
                if (currentBlock !== colHint[m - 1]) return false;
            }
        }

        // Remaining space needed
        let minSpaceNeeded = 0;
        if (lastElementIsFilled && currentBlock > 0) {
            minSpaceNeeded += (colHint[m - 1] - currentBlock);
            const remainingBlocksCount = k - m;
            if (remainingBlocksCount > 0) {
                minSpaceNeeded += 1; // separator
                for (let i = m; i < k; i++) {
                    minSpaceNeeded += colHint[i] + 1;
                }
                minSpaceNeeded -= 1;
            }
        } else {
            const remainingBlocksCount = k - m;
            if (remainingBlocksCount > 0) {
                for (let i = m; i < k; i++) {
                    minSpaceNeeded += colHint[i] + 1;
                }
                minSpaceNeeded -= 1;
            }
        }

        const remainingCells = height - currentHeight;
        if (minSpaceNeeded > remainingCells) {
            return false;
        }

        return true;
    }

    function dfs(row = 0, grid = []) {
        if (row === height) {
            results.push(grid.map(r => [...r]));
            return results.length > 1;
        }

        for (const possibility of rowSolutions[row]) {
            // Try placing this possibility
            grid.push(possibility);

            // Pruning check: are columns still prefix-valid?
            let valid = true;
            for (let c = 0; c < width; c++) {
                if (!isColPrefixValid(c, row + 1, grid)) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                if (dfs(row + 1, grid)) {
                    return true;
                }
            }

            grid.pop();
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
