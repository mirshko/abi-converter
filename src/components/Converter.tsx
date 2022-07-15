import { jsonLanguage } from "@codemirror/lang-json";
import { EditorState } from "@codemirror/state";
import { FormatTypes, Interface } from "@ethersproject/abi";
import { minimalSetup, EditorView } from "codemirror";
import { createSignal, onMount } from "solid-js";
import "./Converter.css";

const JSON_ABI = `[
  {
    "type": "constructor",
    "payable": false,
    "inputs": [
      { "type": "string", "name": "symbol" },
      { "type": "string", "name": "name" }
    ]
  },
  {
    "type": "function",
    "name": "transferFrom",
    "constant": false,
    "payable": false,
    "inputs": [
      { "type": "address", "name": "from" },
      { "type": "address", "name": "to" },
      { "type": "uint256", "name": "value" }
    ],
    "outputs": [ ]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "constant":true,
    "stateMutability": "view",
    "payable":false, "inputs": [
      { "type": "address", "name": "owner"}
    ],
    "outputs": [
      { "type": "uint256"}
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "Transfer",
    "inputs": [
      { "type": "address", "name": "from", "indexed":true},
      { "type": "address", "name": "to", "indexed":true},
      { "type": "address", "name": "value"}
    ]
  },
  {
    "type": "error",
    "name": "InsufficientBalance",
    "inputs": [
      { "type": "account", "name": "owner"},
      { "type": "uint256", "name": "balance"}
    ]
  },
  {
    "type": "function",
    "name": "addPerson",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "tuple",
        "name": "person",
        "components": [
          { "type": "string", "name": "name" },
          { "type": "uint16", "name": "age" }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "addPeople",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "tuple[]",
        "name": "person",
        "components": [
          { "type": "string", "name": "name" },
          { "type": "uint16", "name": "age" }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "getPerson",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      { "type": "uint256", "name": "id" }
    ],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          { "type": "string", "name": "name" },
          { "type": "uint16", "name": "age" }
        ]
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "PersonAdded",
    "inputs": [
      { "type": "uint256", "name": "id", "indexed": true },
      {
        "type": "tuple",
        "name": "person",
        "components": [
          { "type": "string", "name": "name", "indexed": false },
          { "type": "uint16", "name": "age", "indexed": false }
        ]
      }
    ]
  }
]`;

const Converter = () => {
  let ref: HTMLDivElement;

  const [format, formatSet] = createSignal<"minimal" | "full" | "json">("full");

  onMount(() => {
    const inputState = EditorState.create({
      doc: JSON_ABI,
      extensions: [
        minimalSetup,
        jsonLanguage,
        EditorView.theme({
          "&": {
            overflow: "auto",
            height: "calc((100vh - 1rem * 2) - var(--header))",
            backgroundColor: "#fff",
          },
          "& .cm-focused": { outline: "4px solid blue" },
          ".cm-scroller": { overflow: "auto" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const json = update.state.doc.sliceString(0);

            try {
              output.dispatch({
                changes: {
                  from: 0,
                  to: output.state.doc.length,
                  insert: JSON.stringify(
                    format() === "json"
                      ? JSON.parse(new Interface(json).format("json") as string)
                      : new Interface(json).format(format()),
                    null,
                    2
                  ),
                },
              });
            } catch (error) {
              window.alert(error.message);
            }
          }
        }),
      ],
    });

    const input = new EditorView({
      state: inputState,
      parent: ref,
    });

    const outputState = EditorState.create({
      doc: JSON.stringify(
        format() === "json"
          ? JSON.parse(new Interface(JSON_ABI).format("json") as string)
          : new Interface(JSON_ABI).format(format()),
        null,
        2
      ),
      extensions: [
        minimalSetup,
        jsonLanguage,
        EditorState.readOnly.of(true),
        EditorView.theme({
          "&": {
            overflow: "auto",
            height: "calc((100vh - 1rem * 2) - var(--header))",
            backgroundColor: "#fff",
          },
          ".cm-focused": { outline: "4px solid blue" },
          ".cm-scroller": { overflow: "auto" },
        }),
      ],
    });

    const output = new EditorView({
      state: outputState,
      parent: ref,
    });
  });

  return (
    <div class="converter" ref={ref}>
      <div>
        <h2>Input</h2>
      </div>

      <div>
        <h2>Output</h2>

        <label htmlFor="format">format</label>
        <select
          name="format"
          id="format"
          onChange={(e) => formatSet(e.currentTarget.value as any)}
          value={format()}
        >
          {Object.values(FormatTypes).map((value) => (
            <option value={value}>{value}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Converter;
