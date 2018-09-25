import * as ts from 'typescript'

function createGetAccessorExpression(node: ts.Node): ts.Expression {
  if (ts.isPropertyAccessExpression(node)) {
    return ts.createBinary(
      createGetAccessorExpression(node.expression),
      ts.SyntaxKind.AmpersandAmpersandToken,
      node,
    )
  } else if (ts.isElementAccessExpression(node)) {
    let right: ts.Expression
    if (ts.isLiteralExpression(node.argumentExpression)) {
      right = node.argumentExpression
    } else {
      right = createGetAccessorExpression(node.argumentExpression)
    }

    return ts.createBinary(
      createGetAccessorExpression(node.expression),
      ts.SyntaxKind.AmpersandAmpersandToken,
      ts.createElementAccess(node.expression, right),
    )
  } else if (ts.isIdentifier(node)) {
    return node
  } else {
    throw new Error(`Unexpected node ${node.kind}`)
  }
}

function processChainAccessExpression(node: ts.Node, output: ts.Expression[]) {
  if (ts.isElementAccessExpression(node)) {
    output.push(node.argumentExpression)
    processChainAccessExpression(node.expression, output)
  } else if (ts.isPropertyAccessExpression(node)) {
    output.push(ts.createLiteral(node.name.text))
    processChainAccessExpression(node.expression, output)
  } else if (ts.isIdentifier(node)) {
    output.push(node)
  } else {
    throw new Error(`Unexpected node ${node.kind}`)
  }
}

function createSetAccessorExpression(
  node: ts.Node,
  expr: ts.Expression,
  id: ts.Identifier,
) {
  const chain: ts.Expression[] = []
  processChainAccessExpression(node, chain)

  chain.pop()
  return ts.createCall(id, undefined, [
    expr,
    ts.createArrayLiteral(chain.reverse()),
  ])
}

function createVisitorForContext(
  context: ts.TransformationContext,
  helpers: { get?: string; set?: string },
): ts.Visitor {
  const visitor: ts.Visitor = node => {
    if (ts.isCallExpression(node)) {
      const calleeExpression = node.expression

      if (
        ts.isIdentifier(calleeExpression) &&
        helpers.get === calleeExpression.text
      ) {
        const accessorArg = node.arguments[1]
        if (ts.isArrowFunction(accessorArg)) {
          return ts.createCall(
            ts.createArrowFunction(
              accessorArg.modifiers,
              accessorArg.typeParameters,
              accessorArg.parameters,
              accessorArg.type,
              accessorArg.equalsGreaterThanToken,
              createGetAccessorExpression(accessorArg.body),
            ),
            undefined,
            [node.arguments[0]],
          )
        } else {
          throw new Error(`Unexpected node ${node.kind}`)
        }
      } else if (
        ts.isIdentifier(calleeExpression) &&
        helpers.set === calleeExpression.text
      ) {
        const accessorArg = node.arguments[1]
        if (ts.isArrowFunction(accessorArg)) {
          return createSetAccessorExpression(
            accessorArg.body,
            node.arguments[0],
            calleeExpression,
          )
        } else {
          throw new Error(`Unexpected node ${node.kind}`)
        }
      }
    }
    return ts.visitEachChild(node, visitor, context)
  }

  return visitor
}

const IMPORT_MODULE_SPECIFIER_RX = /^segedin\/?/

export default (_program: ts.Program) => (
  context: ts.TransformationContext,
) => (sourceFile: ts.SourceFile) => {
  const helperLocals = {
    get: undefined,
    set: undefined,
  }

  sourceFile.statements.forEach(s => {
    if (ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier)) {
      if (s.importClause && s.importClause.namedBindings) {
        if (s.moduleSpecifier.text.match(IMPORT_MODULE_SPECIFIER_RX)) {
          if (ts.isNamedImports(s.importClause.namedBindings)) {
            s.importClause.namedBindings.elements.forEach(e => {
              if (e.propertyName && e.propertyName.text in helperLocals) {
                helperLocals[e.propertyName.text] = e.name.text
              } else if (!e.propertyName && e.name.text in helperLocals) {
                helperLocals[e.name.text] = e.name.text
              }
            })
          }
        }
      }
    }
  })

  for (const k in helperLocals) {
    if (helperLocals[k]) {
      return ts.visitNode(
        sourceFile,
        createVisitorForContext(context, helperLocals),
      )
    }
  }

  return sourceFile
}
