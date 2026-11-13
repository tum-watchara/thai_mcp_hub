"use client";

import type { JsonValue } from "@repo/schemas";
import { displayPrimitive, isJsonObject } from "@/lib/utils/json";

function Primitive({ value }: { value: JsonValue }) {
  if (value === null) return <span className="text-muted-foreground">null</span>;
  if (typeof value === "boolean") return <code className="font-mono text-[13px]">{String(value)}</code>;
  if (typeof value === "number") return <span className="tabular-nums">{value}</span>;
  return <span className="break-words">{displayPrimitive(value)}</span>;
}

function isFlatObjectArray(value: JsonValue[]): value is { [key: string]: JsonValue }[] {
  return value.length > 0 && value.every((item) => isJsonObject(item));
}

/** Human-readable rendering of a tool result: key/value list, table for lists of records. */
export function JsonView({ value }: { value: JsonValue | undefined }) {
  if (value === undefined) return null;

  if (Array.isArray(value)) {
    if (isFlatObjectArray(value)) {
      const columns = [...new Set(value.flatMap((row) => Object.keys(row)))];
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {columns.map((column) => (
                  <th key={column} scope="col" className="py-2 pr-4 font-mono font-medium whitespace-nowrap">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.map((row, index) => (
                <tr key={index} className="border-b border-border align-top last:border-0">
                  {columns.map((column) => {
                    const cell = row[column];
                    return (
                      <td key={column} className="py-2 pr-4">
                        {cell === undefined ? null : Array.isArray(cell) || isJsonObject(cell) ? (
                          <code className="font-mono text-xs">{JSON.stringify(cell)}</code>
                        ) : (
                          <Primitive value={cell} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <ul className="grid gap-1 text-sm">
        {value.map((item, index) => (
          <li key={index}>
            <JsonView value={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (isJsonObject(value)) {
    return (
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[minmax(120px,max-content)_1fr]">
        {Object.entries(value).map(([key, item]) => (
          <div key={key} className="contents">
            <dt className="font-mono text-[13px] text-muted-foreground">{key}</dt>
            <dd className="min-w-0">
              {Array.isArray(item) || isJsonObject(item) ? <JsonView value={item} /> : <Primitive value={item} />}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <Primitive value={value} />;
}
