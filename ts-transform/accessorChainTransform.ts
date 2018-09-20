import * as ts from "typescript";

function createGetAccessorExpression(node: ts.Node): ts.Expression {
  if (ts.isPropertyAccessExpression(node)) {
    return ts.createBinary(
      createGetAccessorExpression(node.expression),
      ts.SyntaxKind.AmpersandAmpersandToken,
      node
    );
  } else if (ts.isElementAccessExpression(node)) {
    let right: ts.Expression;
    if (ts.isLiteralExpression(node.argumentExpression)) {
      right = node.argumentExpression;
    } else {
      right = createGetAccessorExpression(node.argumentExpression);
    }

    return ts.createBinary(
      createGetAccessorExpression(node.expression),
      ts.SyntaxKind.AmpersandAmpersandToken,
      ts.createElementAccess(node.expression, right)
    );
  } else if (ts.isIdentifier(node)) {
    return node;
  } else {
    throw new Error(`Unexpected node ${node.kind}`);
  }
}

function processChainAccessExpression(node: ts.Node, output: ts.Expression[]) {
  if (ts.isElementAccessExpression(node)) {
    output.push(node.argumentExpression);
    processChainAccessExpression(node.expression, output);
  } else if (ts.isPropertyAccessExpression(node)) {
    output.push(ts.createLiteral(node.name.text));
    processChainAccessExpression(node.expression, output);
  } else if (ts.isIdentifier(node)) {
    output.push(node);
  } else {
    throw new Error(`Unexpected node ${node.kind}`);
  }
}

function createSetAccessorExpression(node: ts.Node, name: string) {
  const chain: ts.Expression[] = [];
  processChainAccessExpression(node, chain);

  chain.pop();
  return ts.createCall(ts.createIdentifier("createSetter"), undefined, [
    ts.createIdentifier(name),
    ts.createArrayLiteral(chain.reverse())
  ]);
}

function createVisitorForContext(
  context: ts.TransformationContext
): ts.Visitor {
  const visitor: ts.Visitor = node => {
    if (ts.isCallExpression(node)) {
      const calleeExpression = node.expression;
      // TODO: proper function identification
      if (ts.isIdentifier(calleeExpression) && calleeExpression.text == "get") {
        const accessorArg = node.arguments[1];
        if (ts.isArrowFunction(accessorArg)) {
          return ts.createCall(
            ts.createArrowFunction(
              accessorArg.modifiers,
              accessorArg.typeParameters,
              accessorArg.parameters,
              accessorArg.type,
              accessorArg.equalsGreaterThanToken,
              createGetAccessorExpression(accessorArg.body)
            ),
            undefined,
            [node.arguments[0]]
          );
        } else {
          throw new Error(`Unexpected node ${node.kind}`);
        }
      } else if (
        ts.isIdentifier(calleeExpression) &&
        calleeExpression.text == "set"
      ) {
        const accessorArg = node.arguments[1];
        if (ts.isArrowFunction(accessorArg)) {
          return ts.createCall(
            ts.createArrowFunction(
              accessorArg.modifiers,
              accessorArg.typeParameters,
              accessorArg.parameters,
              accessorArg.type,
              accessorArg.equalsGreaterThanToken,
              createSetAccessorExpression(
                accessorArg.body,
                accessorArg.parameters[0].getText()
              )
            ),
            undefined,
            [node.arguments[0]]
          );
        } else {
          throw new Error(`Unexpected node ${node.kind}`);
        }
      }
    }
    return ts.visitEachChild(node, visitor, context);
  };

  return visitor;
}

export default (_program: ts.Program) => (
  context: ts.TransformationContext
) => (sourceFile: ts.SourceFile) =>
  ts.visitNode(sourceFile, createVisitorForContext(context));
