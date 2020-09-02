import * as ts from "typescript";
import { readFileSync } from "fs";

function compile(fileName: string, options: ts.CompilerOptions): void {
  const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ true
  );

  function print(node: ts.Node)
  {
    switch (node.kind)
    {
      case ts.SyntaxKind.EndOfFileToken:
        return;
      case ts.SyntaxKind.InterfaceDeclaration:
        let nodeAsID = node as ts.InterfaceDeclaration;
        let parents:string[] = [];
        nodeAsID.heritageClauses?.forEach(
          hc => (hc as ts.HeritageClause).types.forEach(
            t => parents.push(t.getText())
            ));
        let interfaceText = "interface ";
        interfaceText += nodeAsID.name.getText();
        interfaceText += parents != [] ? (" : " + parents.join(", ")) : "";
        interfaceText += " { "
        let members:string[] = [];
        nodeAsID.members.forEach(m => members.push(m.name.getText() + ":" + (m as ts.SignatureDeclaration).type.getText()));
        interfaceText += members.sort().join(", ");
        interfaceText += " } "
        console.log(interfaceText);
        break;
      case ts.SyntaxKind.ModuleDeclaration:
        let nodeAsMD = node as ts.ModuleDeclaration;
        console.log("module " + nodeAsMD.name.getText());
        ts.forEachChild((nodeAsMD.body as ts.ModuleBody), print);
        break;
      case ts.SyntaxKind.NamespaceExportDeclaration:
        let nodeAsNED = node as ts.NamespaceExportDeclaration;
        console.log("namespace export " + nodeAsNED.name.getText());
        break;
      case ts.SyntaxKind.TypeAliasDeclaration:
        let nodeAsTAD = node as ts.TypeAliasDeclaration;
        let typeAliasText = "type alias ";
        typeAliasText += nodeAsTAD.name.getText();
        typeAliasText += " { "
        let typeParams:string[] = [];
        nodeAsTAD.getChildren().forEach(c => {
          if (ts.isUnionTypeNode(c))
          {
            c.types.forEach(c => typeParams.push(c.getFullText()));
          }
        });
        typeAliasText += typeParams.sort().join(", ");
        typeAliasText += " } ";
        console.log(typeAliasText);
        break;
    }
  }

  ts.forEachChild(sourceFile, print);
}

declare const describe, it;

describe('Types', function() {
  this.timeout(10*1000);
  it('Lists all the types', function() {

    compile("C:/github/msgraph-typescript-typings/microsoft-graph.d.ts", {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
    });
  });
});