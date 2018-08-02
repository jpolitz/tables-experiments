const I = require("immutable");
const fs = require("fs");

/*
  sanitizers are, for now:

    { name: String, sanitizer: (String -> a) }
*/

function csvLoader(path, options) {
  return {
    load: function(header, sanitizers) {
      const saniDict = {};
      const contents = String(fs.readFileSync(path));
      const lines = contents.split("\n");
      let startIndex = options["header-row"] ? 1 : 0;
      const indices = {};
      for(let i = 0; i < header.length; i += 1) {
        indices[header[i]] = i;
      }
      const rows = [];
      for(let i = startIndex; i < lines.length; i += 1) {
        rows[i - 1] = lines[i].split("\t");
      }
      for(let i = 0; i < sanitizers.length; i += 1) {
        saniDict[sanitizers[i].name] = sanitizers[i].sanitizer;
      }
      for(let i = 0; i < header.length; i += 1) {
        if(saniDict[header[i]] !== undefined) {
          for(let j = 0; j < rows.length; j += 1) {
            rows[j][i] = saniDict[header[i]](rows[j][i]);
          }
        }
      }
      return makeTable(header, indices, rows);
    }
  };
}

function makeRow(header, indices, row) {
  return {
    'rowvals': row,
    'get-value': function(colname) {
      return row[indices[colname]];
    }
  };
}

function makeTable(header, indices, rows) {
  return {
    'build-column': function(newcol, f) {
      let newRows = [];
      for(let i = 0; i < rows.length; i += 1) {
        let thisRow = rows[i];
        let newVal = f(makeRow(header, indices, rows[i]));
        newRows.push(thisRow.concat([newVal]));
      }
      let newIndices = {};
      let newHeader = header.concat([newcol]);
      for(let i = 0; i < header.length; i += 1) {
        newIndices[header[i]] = i;
      }
      return makeTable(newHeader, newIndices, newRows);
    },
    'filter': function(f) {
      let newRows = [];
      for(let i = 0; i < rows.length; i += 1) {
        if(f(makeRow(header, indices, rows[i]))) {
          newRows.push(rows[i]);
        }
      }
      return makeTable(header, indices, newRows);
    },
    'get-row': function(i) {
      return makeRow(header, indices, rows[i]);
    },
    'get-column': function(colname) {
      let col = [];
      let valIndex = indices[colname];
      for(let i = 0; i < rows.length; i += 1) {
        let thisRow = rows[i];
        col.push(thisRow[valIndex]);
      }
      return col;
    }
  };
}

function mean(nums) {
  let sum = 0;
  for(let i = 0; i < nums.length; i += 1) {
    sum += nums[i];
  }
  return sum / nums.length;
}

function sToN(s) { return Number(s); }

module.exports = {
  'csv-loader': csvLoader,
  mean: mean,
  'string-to-number': sToN
};

