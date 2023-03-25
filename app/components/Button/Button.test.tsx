/** @jest-environment jsdom */
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Button from ".";

describe("Button", () => {
  test("should render button with correct text", () => {
    const { getByText } = render(<Button>Click Me</Button>);
    const buttonElement = getByText("Click Me");
    expect(buttonElement).toBeInTheDocument();
  });

  test("should call onClick function when button is clicked", () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>Click Me</Button>);
    const buttonElement = getByText("Click Me");
    fireEvent.click(buttonElement);
    expect(onClick).toHaveBeenCalled();
  });
});
