// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Fragments of IDL scraped from various sources in May 2017. Stored in a js file for ease
// of synchronous inclusion in diverse test environments.

global.additional_idl_spec = `
interface TestSystem {
  legacycaller boolean someFunction1();
  creator int someFunction2();
  stringifier attribute DOMString id;
};

namespace VectorUtils {
  //readonly attribute int unit;
  double dotProduct(Vector x, Vector y);
  Vector crossProduct(Vector x, Vector y);
};

interface Transaction {
  readonly attribute Account from;
  readonly attribute Account to;
  readonly attribute double amount;
  readonly attribute DOMString description;
  readonly attribute unsigned long number;

  serializer Transaction();
};

interface Account {
  attribute DOMString name;
  attribute unsigned long number;
};

interface OrderedMap {
  readonly attribute unsigned long size;

  getter any getByIndex(unsigned long index);
  setter void setByIndex(unsigned long index, any value);

  getter any get(DOMString name);
  setter void set(DOMString name, any value);
};

interface ArrSerializationPattern {
  attribute Account from;
  attribute Account to;
  serializer = [ from, to ];
};

interface SerializationEmptyMap {
  serializer = { };
};

interface SerializationGetter {
  serializer = { getter };
};

interface nullableTypes {
  const boolean? NULLABLE = null;
  readonly attribute DOMString? namespaceURI;
  readonly attribute Node? parentNode;
};

interface Student {
  attribute unsigned long id;
  stringifier attribute DOMString name;
  stringifier DOMString ();
};

interface test {
  serializer;
};
`;
