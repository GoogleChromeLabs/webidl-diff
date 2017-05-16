// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Some IDL scraped from various specs in Jan 2017. Stored in a js file for ease
// of synchronous inclusion in in diverse test environments.

global.ADDITIONAL_SPEC_IDL_FRAGMENTS = `
partial interface HTMLLinkElement {
  attribute DOMString integrity;
};

partial interface HTMLScriptElement {
  attribute DOMString integrity;
};

partial interface HTMLLinkElement {
  attribute DOMString integrity;
};

partial interface HTMLScriptElement {
  attribute DOMString integrity;
};

[Constructor(DOMString type, optional EventInit eventInitDict),
 Exposed=(Window,Worker)]
interface Event {
  readonly attribute DOMString type;
  readonly attribute EventTarget? target;
  readonly attribute EventTarget? currentTarget;
  sequence<EventTarget> composedPath();

  const unsigned short NONE = 0;
  const unsigned short CAPTURING_PHASE = 1;
  const unsigned short AT_TARGET = 2;
  const unsigned short BUBBLING_PHASE = 3;
  readonly attribute unsigned short eventPhase;

  void stopPropagation();
           attribute boolean cancelBubble; // historical alias of .stopPropagation
  void stopImmediatePropagation();

  readonly attribute boolean bubbles;
  readonly attribute boolean cancelable;
  void preventDefault();
  readonly attribute boolean defaultPrevented;
  readonly attribute boolean composed;

  [Unforgeable] readonly attribute boolean isTrusted;
  readonly attribute DOMTimeStamp timeStamp;

  void initEvent(DOMString type, boolean bubbles, boolean cancelable); // historical
};

dictionary EventInit {
  boolean bubbles = false;
  boolean cancelable = false;
  boolean composed = false;
};

[Constructor(DOMString type, optional CustomEventInit eventInitDict),
 Exposed=(Window,Worker)]
interface CustomEvent : Event {
  readonly attribute any detail;

  void initCustomEvent(DOMString type, boolean bubbles, boolean cancelable, any detail);
};

dictionary CustomEventInit : EventInit {
  any detail = null;
};

[Exposed=(Window,Worker)]
interface EventTarget {
  void addEventListener(DOMString type, EventListener? callback, optional (AddEventListenerOptions or boolean) options);
  void removeEventListener(DOMString type, EventListener? callback, optional (EventListenerOptions or boolean) options);
  boolean dispatchEvent(Event event);
};

callback interface EventListener {
  void handleEvent(Event event);
};

dictionary EventListenerOptions {
  boolean capture = false;
};

dictionary AddEventListenerOptions : EventListenerOptions {
  boolean passive = false;
  boolean once = false;
};
[NoInterfaceObject,
 Exposed=Window]
interface NonElementParentNode {
  Element? getElementById(DOMString elementId);
};
Document implements NonElementParentNode;
DocumentFragment implements NonElementParentNode;

[NoInterfaceObject,
 Exposed=Window]
interface DocumentOrShadowRoot {
};
Document implements DocumentOrShadowRoot;
ShadowRoot implements DocumentOrShadowRoot;

[NoInterfaceObject,
 Exposed=Window]
interface ParentNode {
  [SameObject] readonly attribute HTMLCollection children;
  readonly attribute Element? firstElementChild;
  readonly attribute Element? lastElementChild;
  readonly attribute unsigned long childElementCount;

  [CEReactions, Unscopable] void prepend((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void append((Node or DOMString)... nodes);

  Element? querySelector(DOMString selectors);
  [NewObject] NodeList querySelectorAll(DOMString selectors);
};
Document implements ParentNode;
DocumentFragment implements ParentNode;
Element implements ParentNode;

[NoInterfaceObject,
 Exposed=Window]
interface NonDocumentTypeChildNode {
  readonly attribute Element? previousElementSibling;
  readonly attribute Element? nextElementSibling;
};
Element implements NonDocumentTypeChildNode;
CharacterData implements NonDocumentTypeChildNode;

[NoInterfaceObject,
 Exposed=Window]
interface ChildNode {
  [CEReactions, Unscopable] void before((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void after((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void replaceWith((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void remove();
};
DocumentType implements ChildNode;
Element implements ChildNode;
CharacterData implements ChildNode;

[NoInterfaceObject,
 Exposed=Window]
interface Slotable {
  readonly attribute HTMLSlotElement? assignedSlot;
};
Element implements Slotable;
Text implements Slotable;

[Exposed=Window]
interface NodeList {
  getter Node? item(unsigned long index);
  readonly attribute unsigned long length;
  iterable<Node>;
};

[Exposed=Window, LegacyUnenumerableNamedProperties]
interface HTMLCollection {
  readonly attribute unsigned long length;
  getter Element? item(unsigned long index);
  getter Element? namedItem(DOMString name);
};

[Constructor(MutationCallback callback)]
interface MutationObserver {
  void observe(Node target, optional MutationObserverInit options);
  void disconnect();
  sequence<MutationRecord> takeRecords();
};

callback MutationCallback = void (sequence<MutationRecord> mutations, MutationObserver observer);

dictionary MutationObserverInit {
  boolean childList = false;
  boolean attributes;
  boolean characterData;
  boolean subtree = false;
  boolean attributeOldValue;
  boolean characterDataOldValue;
  sequence<DOMString> attributeFilter;
};

[Exposed=Window]
interface MutationRecord {
  readonly attribute DOMString type;
  [SameObject] readonly attribute Node target;
  [SameObject] readonly attribute NodeList addedNodes;
  [SameObject] readonly attribute NodeList removedNodes;
  readonly attribute Node? previousSibling;
  readonly attribute Node? nextSibling;
  readonly attribute DOMString? attributeName;
  readonly attribute DOMString? attributeNamespace;
  readonly attribute DOMString? oldValue;
};

[Exposed=Window]
interface Node : EventTarget {
  const unsigned short ELEMENT_NODE = 1;
  const unsigned short ATTRIBUTE_NODE = 2;
  const unsigned short TEXT_NODE = 3;
  const unsigned short CDATA_SECTION_NODE = 4;
  const unsigned short ENTITY_REFERENCE_NODE = 5; // historical
  const unsigned short ENTITY_NODE = 6; // historical
  const unsigned short PROCESSING_INSTRUCTION_NODE = 7;
  const unsigned short COMMENT_NODE = 8;
  const unsigned short DOCUMENT_NODE = 9;
  const unsigned short DOCUMENT_TYPE_NODE = 10;
  const unsigned short DOCUMENT_FRAGMENT_NODE = 11;
  const unsigned short NOTATION_NODE = 12; // historical
  readonly attribute unsigned short nodeType;
  readonly attribute DOMString nodeName;

  readonly attribute USVString baseURI;

  readonly attribute boolean isConnected;
  readonly attribute Document? ownerDocument;
  Node getRootNode(optional GetRootNodeOptions options);
  readonly attribute Node? parentNode;
  readonly attribute Element? parentElement;
  boolean hasChildNodes();
  [SameObject] readonly attribute NodeList childNodes;
  readonly attribute Node? firstChild;
  readonly attribute Node? lastChild;
  readonly attribute Node? previousSibling;
  readonly attribute Node? nextSibling;

  [CEReactions] attribute DOMString? nodeValue;
  [CEReactions] attribute DOMString? textContent;
  [CEReactions] void normalize();

  [CEReactions, NewObject] Node cloneNode(optional boolean deep = false);
  boolean isEqualNode(Node? otherNode);
  boolean isSameNode(Node? otherNode); // historical alias of ===

  const unsigned short DOCUMENT_POSITION_DISCONNECTED = 0x01;
  const unsigned short DOCUMENT_POSITION_PRECEDING = 0x02;
  const unsigned short DOCUMENT_POSITION_FOLLOWING = 0x04;
  const unsigned short DOCUMENT_POSITION_CONTAINS = 0x08;
  const unsigned short DOCUMENT_POSITION_CONTAINED_BY = 0x10;
  const unsigned short DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;
  unsigned short compareDocumentPosition(Node other);
  boolean contains(Node? other);

  DOMString? lookupPrefix(DOMString? namespace);
  DOMString? lookupNamespaceURI(DOMString? prefix);
  boolean isDefaultNamespace(DOMString? namespace);

  [CEReactions] Node insertBefore(Node node, Node? child);
  [CEReactions] Node appendChild(Node node);
  [CEReactions] Node replaceChild(Node node, Node child);
  [CEReactions] Node removeChild(Node child);
};

dictionary GetRootNodeOptions {
  boolean composed = false;
};

[Constructor,
 Exposed=Window]
interface Document : Node {
  [SameObject] readonly attribute DOMImplementation implementation;
  readonly attribute USVString URL;
  readonly attribute USVString documentURI;
  readonly attribute USVString origin;
  readonly attribute DOMString compatMode;
  readonly attribute DOMString characterSet;
  readonly attribute DOMString charset; // historical alias of .characterSet
  readonly attribute DOMString inputEncoding; // historical alias of .characterSet
  readonly attribute DOMString contentType;

  readonly attribute DocumentType? doctype;
  readonly attribute Element? documentElement;
  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByTagNameNS(DOMString? namespace, DOMString localName);
  HTMLCollection getElementsByClassName(DOMString classNames);

  [NewObject] Element createElement(DOMString localName, optional ElementCreationOptions options);
  [NewObject] Element createElementNS(DOMString? namespace, DOMString qualifiedName, optional ElementCreationOptions options);
  [NewObject] DocumentFragment createDocumentFragment();
  [NewObject] Text createTextNode(DOMString data);
  [NewObject] CDATASection createCDATASection(DOMString data);
  [NewObject] Comment createComment(DOMString data);
  [NewObject] ProcessingInstruction createProcessingInstruction(DOMString target, DOMString data);

  [CEReactions, NewObject] Node importNode(Node node, optional boolean deep = false);
  [CEReactions] Node adoptNode(Node node);

  [NewObject] Attr createAttribute(DOMString localName);
  [NewObject] Attr createAttributeNS(DOMString? namespace, DOMString qualifiedName);

  [NewObject] Event createEvent(DOMString interface);

  [NewObject] Range createRange();

  // NodeFilter.SHOW_ALL = 0xFFFFFFFF
  [NewObject] NodeIterator createNodeIterator(Node root, optional unsigned long whatToShow = 0xFFFFFFFF, optional NodeFilter? filter = null);
  [NewObject] TreeWalker createTreeWalker(Node root, optional unsigned long whatToShow = 0xFFFFFFFF, optional NodeFilter? filter = null);
};

[Exposed=Window]
interface XMLDocument : Document {};

dictionary ElementCreationOptions {
  DOMString is;
};

[Exposed=Window]
interface DOMImplementation {
  [NewObject] DocumentType createDocumentType(DOMString qualifiedName, DOMString publicId, DOMString systemId);
  [NewObject] XMLDocument createDocument(DOMString? namespace, [TreatNullAs=EmptyString] DOMString qualifiedName, optional DocumentType? doctype = null);
  [NewObject] Document createHTMLDocument(optional DOMString title);

  boolean hasFeature(); // useless; always returns true
};

[Exposed=Window]
interface DocumentType : Node {
  readonly attribute DOMString name;
  readonly attribute DOMString publicId;
  readonly attribute DOMString systemId;
};

[Constructor,
 Exposed=Window]
interface DocumentFragment : Node {
};

[Exposed=Window]
interface ShadowRoot : DocumentFragment {
  readonly attribute ShadowRootMode mode;
  readonly attribute Element host;
};

enum ShadowRootMode { "open", "closed" };

[Exposed=Window]
interface Element : Node {
  readonly attribute DOMString? namespaceURI;
  readonly attribute DOMString? prefix;
  readonly attribute DOMString localName;
  readonly attribute DOMString tagName;

  [CEReactions] attribute DOMString id;
  [CEReactions] attribute DOMString className;
  [CEReactions, SameObject, PutForwards=value] readonly attribute DOMTokenList classList;
  [CEReactions, Unscopable] attribute DOMString slot;

  boolean hasAttributes();
  [SameObject] readonly attribute NamedNodeMap attributes;
  sequence<DOMString> getAttributeNames();
  DOMString? getAttribute(DOMString qualifiedName);
  DOMString? getAttributeNS(DOMString? namespace, DOMString localName);
  [CEReactions] void setAttribute(DOMString qualifiedName, DOMString value);
  [CEReactions] void setAttributeNS(DOMString? namespace, DOMString qualifiedName, DOMString value);
  [CEReactions] void removeAttribute(DOMString qualifiedName);
  [CEReactions] void removeAttributeNS(DOMString? namespace, DOMString localName);
  boolean hasAttribute(DOMString qualifiedName);
  boolean hasAttributeNS(DOMString? namespace, DOMString localName);

  Attr? getAttributeNode(DOMString qualifiedName);
  Attr? getAttributeNodeNS(DOMString? namespace, DOMString localName);
  [CEReactions] Attr? setAttributeNode(Attr attr);
  [CEReactions] Attr? setAttributeNodeNS(Attr attr);
  [CEReactions] Attr removeAttributeNode(Attr attr);

  ShadowRoot attachShadow(ShadowRootInit init);
  readonly attribute ShadowRoot? shadowRoot;

  Element? closest(DOMString selectors);
  boolean matches(DOMString selectors);
  boolean webkitMatchesSelector(DOMString selectors); // historical alias of .matches

  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByTagNameNS(DOMString? namespace, DOMString localName);
  HTMLCollection getElementsByClassName(DOMString classNames);

  [CEReactions] Element? insertAdjacentElement(DOMString where, Element element); // historical
  void insertAdjacentText(DOMString where, DOMString data); // historical
};

dictionary ShadowRootInit {
  required ShadowRootMode mode;
};

[Exposed=Window, LegacyUnenumerableNamedProperties]
interface NamedNodeMap {
  readonly attribute unsigned long length;
  getter Attr? item(unsigned long index);
  getter Attr? getNamedItem(DOMString qualifiedName);
  Attr? getNamedItemNS(DOMString? namespace, DOMString localName);
  [CEReactions] Attr? setNamedItem(Attr attr);
  [CEReactions] Attr? setNamedItemNS(Attr attr);
  [CEReactions] Attr removeNamedItem(DOMString qualifiedName);
  [CEReactions] Attr removeNamedItemNS(DOMString? namespace, DOMString localName);
};

[Exposed=Window]
interface Attr : Node {
  readonly attribute DOMString? namespaceURI;
  readonly attribute DOMString? prefix;
  readonly attribute DOMString localName;
  readonly attribute DOMString name;
  [CEReactions] attribute DOMString value;

  readonly attribute Element? ownerElement;

  readonly attribute boolean specified; // useless; always returns true
};
[Exposed=Window]
interface CharacterData : Node {
  [TreatNullAs=EmptyString] attribute DOMString data;
  readonly attribute unsigned long length;
  DOMString substringData(unsigned long offset, unsigned long count);
  void appendData(DOMString data);
  void insertData(unsigned long offset, DOMString data);
  void deleteData(unsigned long offset, unsigned long count);
  void replaceData(unsigned long offset, unsigned long count, DOMString data);
};

[Constructor(optional DOMString data = ""),
 Exposed=Window]
interface Text : CharacterData {
  [NewObject] Text splitText(unsigned long offset);
  readonly attribute DOMString wholeText;
};
[Exposed=Window]
interface CDATASection : Text {
};
[Exposed=Window]
interface ProcessingInstruction : CharacterData {
  readonly attribute DOMString target;
};
[Constructor(optional DOMString data = ""),
 Exposed=Window]
interface Comment : CharacterData {
};

[Constructor,
 Exposed=Window]
interface Range {
  readonly attribute Node startContainer;
  readonly attribute unsigned long startOffset;
  readonly attribute Node endContainer;
  readonly attribute unsigned long endOffset;
  readonly attribute boolean collapsed;
  readonly attribute Node commonAncestorContainer;

  void setStart(Node node, unsigned long offset);
  void setEnd(Node node, unsigned long offset);
  void setStartBefore(Node node);
  void setStartAfter(Node node);
  void setEndBefore(Node node);
  void setEndAfter(Node node);
  void collapse(optional boolean toStart = false);
  void selectNode(Node node);
  void selectNodeContents(Node node);

  const unsigned short START_TO_START = 0;
  const unsigned short START_TO_END = 1;
  const unsigned short END_TO_END = 2;
  const unsigned short END_TO_START = 3;
  short compareBoundaryPoints(unsigned short how, Range sourceRange);

  [CEReactions] void deleteContents();
  [CEReactions, NewObject] DocumentFragment extractContents();
  [CEReactions, NewObject] DocumentFragment cloneContents();
  [CEReactions] void insertNode(Node node);
  [CEReactions] void surroundContents(Node newParent);

  [NewObject] Range cloneRange();
  void detach();

  boolean isPointInRange(Node node, unsigned long offset);
  short comparePoint(Node node, unsigned long offset);

  boolean intersectsNode(Node node);

  stringifier;
};

[Exposed=Window]
interface NodeIterator {
  [SameObject] readonly attribute Node root;
  readonly attribute Node referenceNode;
  readonly attribute boolean pointerBeforeReferenceNode;
  readonly attribute unsigned long whatToShow;
  readonly attribute NodeFilter? filter;

  Node? nextNode();
  Node? previousNode();

  void detach();
};

[Exposed=Window]
interface TreeWalker {
  [SameObject] readonly attribute Node root;
  readonly attribute unsigned long whatToShow;
  readonly attribute NodeFilter? filter;
           attribute Node currentNode;

  Node? parentNode();
  Node? firstChild();
  Node? lastChild();
  Node? previousSibling();
  Node? nextSibling();
  Node? previousNode();
  Node? nextNode();
};
[Exposed=Window]
callback interface NodeFilter {
  // Constants for acceptNode()
  const unsigned short FILTER_ACCEPT = 1;
  const unsigned short FILTER_REJECT = 2;
  const unsigned short FILTER_SKIP = 3;

  // Constants for whatToShow
  const unsigned long SHOW_ALL = 0xFFFFFFFF;
  const unsigned long SHOW_ELEMENT = 0x1;
  const unsigned long SHOW_ATTRIBUTE = 0x2;
  const unsigned long SHOW_TEXT = 0x4;
  const unsigned long SHOW_CDATA_SECTION = 0x8;
  const unsigned long SHOW_ENTITY_REFERENCE = 0x10; // historical
  const unsigned long SHOW_ENTITY = 0x20; // historical
  const unsigned long SHOW_PROCESSING_INSTRUCTION = 0x40;
  const unsigned long SHOW_COMMENT = 0x80;
  const unsigned long SHOW_DOCUMENT = 0x100;
  const unsigned long SHOW_DOCUMENT_TYPE = 0x200;
  const unsigned long SHOW_DOCUMENT_FRAGMENT = 0x400;
  const unsigned long SHOW_NOTATION = 0x800; // historical

  unsigned short acceptNode(Node node);
};

interface DOMTokenList {
  readonly attribute unsigned long length;
  getter DOMString? item(unsigned long index);
  boolean contains(DOMString token);
  [CEReactions] void add(DOMString... tokens);
  [CEReactions] void remove(DOMString... tokens);
  [CEReactions] boolean toggle(DOMString token, optional boolean force);
  [CEReactions] void replace(DOMString token, DOMString newToken);
  boolean supports(DOMString token);
  [CEReactions] stringifier attribute DOMString value;
  iterable<DOMString>;
};

[Constructor(DOMString type, optional EventInit eventInitDict),
 Exposed=(Window,Worker)]
interface Event {
  readonly attribute DOMString type;
  readonly attribute EventTarget? target;
  readonly attribute EventTarget? currentTarget;
  sequence<EventTarget> composedPath();

  const unsigned short NONE = 0;
  const unsigned short CAPTURING_PHASE = 1;
  const unsigned short AT_TARGET = 2;
  const unsigned short BUBBLING_PHASE = 3;
  readonly attribute unsigned short eventPhase;

  void stopPropagation();
           attribute boolean cancelBubble; // historical alias of .stopPropagation
  void stopImmediatePropagation();

  readonly attribute boolean bubbles;
  readonly attribute boolean cancelable;
  void preventDefault();
  readonly attribute boolean defaultPrevented;
  readonly attribute boolean composed;

  [Unforgeable] readonly attribute boolean isTrusted;
  readonly attribute DOMTimeStamp timeStamp;

  void initEvent(DOMString type, boolean bubbles, boolean cancelable); // historical
};

dictionary EventInit {
  boolean bubbles = false;
  boolean cancelable = false;
  boolean composed = false;
};

[Constructor(DOMString type, optional CustomEventInit eventInitDict),
 Exposed=(Window,Worker)]
interface CustomEvent : Event {
  readonly attribute any detail;

  void initCustomEvent(DOMString type, boolean bubbles, boolean cancelable, any detail);
};

dictionary CustomEventInit : EventInit {
  any detail = null;
};

[Exposed=(Window,Worker)]
interface EventTarget {
  void addEventListener(DOMString type, EventListener? callback, optional (AddEventListenerOptions or boolean) options);
  void removeEventListener(DOMString type, EventListener? callback, optional (EventListenerOptions or boolean) options);
  boolean dispatchEvent(Event event);
};

callback interface EventListener {
  void handleEvent(Event event);
};

dictionary EventListenerOptions {
  boolean capture = false;
};

dictionary AddEventListenerOptions : EventListenerOptions {
  boolean passive = false;
  boolean once = false;
};

[NoInterfaceObject,
 Exposed=Window]
interface NonElementParentNode {
  Element? getElementById(DOMString elementId);
};
Document implements NonElementParentNode;
DocumentFragment implements NonElementParentNode;

[NoInterfaceObject,
 Exposed=Window]
interface DocumentOrShadowRoot {
};
Document implements DocumentOrShadowRoot;
ShadowRoot implements DocumentOrShadowRoot;

[NoInterfaceObject,
 Exposed=Window]
interface ParentNode {
  [SameObject] readonly attribute HTMLCollection children;
  readonly attribute Element? firstElementChild;
  readonly attribute Element? lastElementChild;
  readonly attribute unsigned long childElementCount;

  [CEReactions, Unscopable] void prepend((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void append((Node or DOMString)... nodes);

  Element? querySelector(DOMString selectors);
  [NewObject] NodeList querySelectorAll(DOMString selectors);
};
Document implements ParentNode;
DocumentFragment implements ParentNode;
Element implements ParentNode;

[NoInterfaceObject,
 Exposed=Window]
interface NonDocumentTypeChildNode {
  readonly attribute Element? previousElementSibling;
  readonly attribute Element? nextElementSibling;
};
Element implements NonDocumentTypeChildNode;
CharacterData implements NonDocumentTypeChildNode;

[NoInterfaceObject,
 Exposed=Window]
interface ChildNode {
  [CEReactions, Unscopable] void before((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void after((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void replaceWith((Node or DOMString)... nodes);
  [CEReactions, Unscopable] void remove();
};
DocumentType implements ChildNode;
Element implements ChildNode;
CharacterData implements ChildNode;

[NoInterfaceObject,
 Exposed=Window]
interface Slotable {
  readonly attribute HTMLSlotElement? assignedSlot;
};
Element implements Slotable;
Text implements Slotable;

[Exposed=Window]
interface NodeList {
  getter Node? item(unsigned long index);
  readonly attribute unsigned long length;
  iterable<Node>;
};

[Exposed=Window, LegacyUnenumerableNamedProperties]
interface HTMLCollection {
  readonly attribute unsigned long length;
  getter Element? item(unsigned long index);
  getter Element? namedItem(DOMString name);
};

[Constructor(MutationCallback callback)]
interface MutationObserver {
  void observe(Node target, optional MutationObserverInit options);
  void disconnect();
  sequence<MutationRecord> takeRecords();
};

callback MutationCallback = void (sequence<MutationRecord> mutations, MutationObserver observer);

dictionary MutationObserverInit {
  boolean childList = false;
  boolean attributes;
  boolean characterData;
  boolean subtree = false;
  boolean attributeOldValue;
  boolean characterDataOldValue;
  sequence<DOMString> attributeFilter;
};

[Exposed=Window]
interface MutationRecord {
  readonly attribute DOMString type;
  [SameObject] readonly attribute Node target;
  [SameObject] readonly attribute NodeList addedNodes;
  [SameObject] readonly attribute NodeList removedNodes;
  readonly attribute Node? previousSibling;
  readonly attribute Node? nextSibling;
  readonly attribute DOMString? attributeName;
  readonly attribute DOMString? attributeNamespace;
  readonly attribute DOMString? oldValue;
};

[Exposed=Window]
interface Node : EventTarget {
  const unsigned short ELEMENT_NODE = 1;
  const unsigned short ATTRIBUTE_NODE = 2;
  const unsigned short TEXT_NODE = 3;
  const unsigned short CDATA_SECTION_NODE = 4;
  const unsigned short ENTITY_REFERENCE_NODE = 5; // historical
  const unsigned short ENTITY_NODE = 6; // historical
  const unsigned short PROCESSING_INSTRUCTION_NODE = 7;
  const unsigned short COMMENT_NODE = 8;
  const unsigned short DOCUMENT_NODE = 9;
  const unsigned short DOCUMENT_TYPE_NODE = 10;
  const unsigned short DOCUMENT_FRAGMENT_NODE = 11;
  const unsigned short NOTATION_NODE = 12; // historical
  readonly attribute unsigned short nodeType;
  readonly attribute DOMString nodeName;

  readonly attribute USVString baseURI;

  readonly attribute boolean isConnected;
  readonly attribute Document? ownerDocument;
  Node getRootNode(optional GetRootNodeOptions options);
  readonly attribute Node? parentNode;
  readonly attribute Element? parentElement;
  boolean hasChildNodes();
  [SameObject] readonly attribute NodeList childNodes;
  readonly attribute Node? firstChild;
  readonly attribute Node? lastChild;
  readonly attribute Node? previousSibling;
  readonly attribute Node? nextSibling;

  [CEReactions] attribute DOMString? nodeValue;
  [CEReactions] attribute DOMString? textContent;
  [CEReactions] void normalize();

  [CEReactions, NewObject] Node cloneNode(optional boolean deep = false);
  boolean isEqualNode(Node? otherNode);
  boolean isSameNode(Node? otherNode); // historical alias of ===

  const unsigned short DOCUMENT_POSITION_DISCONNECTED = 0x01;
  const unsigned short DOCUMENT_POSITION_PRECEDING = 0x02;
  const unsigned short DOCUMENT_POSITION_FOLLOWING = 0x04;
  const unsigned short DOCUMENT_POSITION_CONTAINS = 0x08;
  const unsigned short DOCUMENT_POSITION_CONTAINED_BY = 0x10;
  const unsigned short DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;
  unsigned short compareDocumentPosition(Node other);
  boolean contains(Node? other);

  DOMString? lookupPrefix(DOMString? namespace);
  DOMString? lookupNamespaceURI(DOMString? prefix);
  boolean isDefaultNamespace(DOMString? namespace);

  [CEReactions] Node insertBefore(Node node, Node? child);
  [CEReactions] Node appendChild(Node node);
  [CEReactions] Node replaceChild(Node node, Node child);
  [CEReactions] Node removeChild(Node child);
};

dictionary GetRootNodeOptions {
  boolean composed = false;
};

[Constructor,
 Exposed=Window]
interface Document : Node {
  [SameObject] readonly attribute DOMImplementation implementation;
  readonly attribute USVString URL;
  readonly attribute USVString documentURI;
  readonly attribute USVString origin;
  readonly attribute DOMString compatMode;
  readonly attribute DOMString characterSet;
  readonly attribute DOMString charset; // historical alias of .characterSet
  readonly attribute DOMString inputEncoding; // historical alias of .characterSet
  readonly attribute DOMString contentType;

  readonly attribute DocumentType? doctype;
  readonly attribute Element? documentElement;
  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByTagNameNS(DOMString? namespace, DOMString localName);
  HTMLCollection getElementsByClassName(DOMString classNames);

  [NewObject] Element createElement(DOMString localName, optional ElementCreationOptions options);
  [NewObject] Element createElementNS(DOMString? namespace, DOMString qualifiedName, optional ElementCreationOptions options);
  [NewObject] DocumentFragment createDocumentFragment();
  [NewObject] Text createTextNode(DOMString data);
  [NewObject] CDATASection createCDATASection(DOMString data);
  [NewObject] Comment createComment(DOMString data);
  [NewObject] ProcessingInstruction createProcessingInstruction(DOMString target, DOMString data);

  [CEReactions, NewObject] Node importNode(Node node, optional boolean deep = false);
  [CEReactions] Node adoptNode(Node node);

  [NewObject] Attr createAttribute(DOMString localName);
  [NewObject] Attr createAttributeNS(DOMString? namespace, DOMString qualifiedName);

  [NewObject] Event createEvent(DOMString interface);

  [NewObject] Range createRange();

  // NodeFilter.SHOW_ALL = 0xFFFFFFFF
  [NewObject] NodeIterator createNodeIterator(Node root, optional unsigned long whatToShow = 0xFFFFFFFF, optional NodeFilter? filter = null);
  [NewObject] TreeWalker createTreeWalker(Node root, optional unsigned long whatToShow = 0xFFFFFFFF, optional NodeFilter? filter = null);
};

[Exposed=Window]
interface XMLDocument : Document {};

dictionary ElementCreationOptions {
  DOMString is;
};

[Exposed=Window]
interface DOMImplementation {
  [NewObject] DocumentType createDocumentType(DOMString qualifiedName, DOMString publicId, DOMString systemId);
  [NewObject] XMLDocument createDocument(DOMString? namespace, [TreatNullAs=EmptyString] DOMString qualifiedName, optional DocumentType? doctype = null);
  [NewObject] Document createHTMLDocument(optional DOMString title);

  boolean hasFeature(); // useless; always returns true
};

[Exposed=Window]
interface DocumentType : Node {
  readonly attribute DOMString name;
  readonly attribute DOMString publicId;
  readonly attribute DOMString systemId;
};

[Constructor,
 Exposed=Window]
interface DocumentFragment : Node {
};

[Exposed=Window]
interface ShadowRoot : DocumentFragment {
  readonly attribute ShadowRootMode mode;
  readonly attribute Element host;
};

enum ShadowRootMode { "open", "closed" };

[Exposed=Window]
interface Element : Node {
  readonly attribute DOMString? namespaceURI;
  readonly attribute DOMString? prefix;
  readonly attribute DOMString localName;
  readonly attribute DOMString tagName;

  [CEReactions] attribute DOMString id;
  [CEReactions] attribute DOMString className;
  [CEReactions, SameObject, PutForwards=value] readonly attribute DOMTokenList classList;
  [CEReactions, Unscopable] attribute DOMString slot;

  boolean hasAttributes();
  [SameObject] readonly attribute NamedNodeMap attributes;
  sequence<DOMString> getAttributeNames();
  DOMString? getAttribute(DOMString qualifiedName);
  DOMString? getAttributeNS(DOMString? namespace, DOMString localName);
  [CEReactions] void setAttribute(DOMString qualifiedName, DOMString value);
  [CEReactions] void setAttributeNS(DOMString? namespace, DOMString qualifiedName, DOMString value);
  [CEReactions] void removeAttribute(DOMString qualifiedName);
  [CEReactions] void removeAttributeNS(DOMString? namespace, DOMString localName);
  boolean hasAttribute(DOMString qualifiedName);
  boolean hasAttributeNS(DOMString? namespace, DOMString localName);

  Attr? getAttributeNode(DOMString qualifiedName);
  Attr? getAttributeNodeNS(DOMString? namespace, DOMString localName);
  [CEReactions] Attr? setAttributeNode(Attr attr);
  [CEReactions] Attr? setAttributeNodeNS(Attr attr);
  [CEReactions] Attr removeAttributeNode(Attr attr);

  ShadowRoot attachShadow(ShadowRootInit init);
  readonly attribute ShadowRoot? shadowRoot;

  Element? closest(DOMString selectors);
  boolean matches(DOMString selectors);
  boolean webkitMatchesSelector(DOMString selectors); // historical alias of .matches

  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByTagNameNS(DOMString? namespace, DOMString localName);
  HTMLCollection getElementsByClassName(DOMString classNames);

  [CEReactions] Element? insertAdjacentElement(DOMString where, Element element); // historical
  void insertAdjacentText(DOMString where, DOMString data); // historical
};

dictionary ShadowRootInit {
  required ShadowRootMode mode;
};

[Exposed=Window, LegacyUnenumerableNamedProperties]
interface NamedNodeMap {
  readonly attribute unsigned long length;
  getter Attr? item(unsigned long index);
  getter Attr? getNamedItem(DOMString qualifiedName);
  Attr? getNamedItemNS(DOMString? namespace, DOMString localName);
  [CEReactions] Attr? setNamedItem(Attr attr);
  [CEReactions] Attr? setNamedItemNS(Attr attr);
  [CEReactions] Attr removeNamedItem(DOMString qualifiedName);
  [CEReactions] Attr removeNamedItemNS(DOMString? namespace, DOMString localName);
};

[Exposed=Window]
interface Attr : Node {
  readonly attribute DOMString? namespaceURI;
  readonly attribute DOMString? prefix;
  readonly attribute DOMString localName;
  readonly attribute DOMString name;
  [CEReactions] attribute DOMString value;

  readonly attribute Element? ownerElement;

  readonly attribute boolean specified; // useless; always returns true
};
[Exposed=Window]
interface CharacterData : Node {
  [TreatNullAs=EmptyString] attribute DOMString data;
  readonly attribute unsigned long length;
  DOMString substringData(unsigned long offset, unsigned long count);
  void appendData(DOMString data);
  void insertData(unsigned long offset, DOMString data);
  void deleteData(unsigned long offset, unsigned long count);
  void replaceData(unsigned long offset, unsigned long count, DOMString data);
};

[Constructor(optional DOMString data = ""),
 Exposed=Window]
interface Text : CharacterData {
  [NewObject] Text splitText(unsigned long offset);
  readonly attribute DOMString wholeText;
};
[Exposed=Window]
interface CDATASection : Text {
};
[Exposed=Window]
interface ProcessingInstruction : CharacterData {
  readonly attribute DOMString target;
};
[Constructor(optional DOMString data = ""),
 Exposed=Window]
interface Comment : CharacterData {
};

[Constructor,
 Exposed=Window]
interface Range {
  readonly attribute Node startContainer;
  readonly attribute unsigned long startOffset;
  readonly attribute Node endContainer;
  readonly attribute unsigned long endOffset;
  readonly attribute boolean collapsed;
  readonly attribute Node commonAncestorContainer;

  void setStart(Node node, unsigned long offset);
  void setEnd(Node node, unsigned long offset);
  void setStartBefore(Node node);
  void setStartAfter(Node node);
  void setEndBefore(Node node);
  void setEndAfter(Node node);
  void collapse(optional boolean toStart = false);
  void selectNode(Node node);
  void selectNodeContents(Node node);

  const unsigned short START_TO_START = 0;
  const unsigned short START_TO_END = 1;
  const unsigned short END_TO_END = 2;
  const unsigned short END_TO_START = 3;
  short compareBoundaryPoints(unsigned short how, Range sourceRange);

  [CEReactions] void deleteContents();
  [CEReactions, NewObject] DocumentFragment extractContents();
  [CEReactions, NewObject] DocumentFragment cloneContents();
  [CEReactions] void insertNode(Node node);
  [CEReactions] void surroundContents(Node newParent);

  [NewObject] Range cloneRange();
  void detach();

  boolean isPointInRange(Node node, unsigned long offset);
  short comparePoint(Node node, unsigned long offset);

  boolean intersectsNode(Node node);

  stringifier;
};

[Exposed=Window]
interface NodeIterator {
  [SameObject] readonly attribute Node root;
  readonly attribute Node referenceNode;
  readonly attribute boolean pointerBeforeReferenceNode;
  readonly attribute unsigned long whatToShow;
  readonly attribute NodeFilter? filter;

  Node? nextNode();
  Node? previousNode();

  void detach();
};

[Exposed=Window]
interface TreeWalker {
  [SameObject] readonly attribute Node root;
  readonly attribute unsigned long whatToShow;
  readonly attribute NodeFilter? filter;
           attribute Node currentNode;

  Node? parentNode();
  Node? firstChild();
  Node? lastChild();
  Node? previousSibling();
  Node? nextSibling();
  Node? previousNode();
  Node? nextNode();
};
[Exposed=Window]
callback interface NodeFilter {
  // Constants for acceptNode()
  const unsigned short FILTER_ACCEPT = 1;
  const unsigned short FILTER_REJECT = 2;
  const unsigned short FILTER_SKIP = 3;

  // Constants for whatToShow
  const unsigned long SHOW_ALL = 0xFFFFFFFF;
  const unsigned long SHOW_ELEMENT = 0x1;
  const unsigned long SHOW_ATTRIBUTE = 0x2;
  const unsigned long SHOW_TEXT = 0x4;
  const unsigned long SHOW_CDATA_SECTION = 0x8;
  const unsigned long SHOW_ENTITY_REFERENCE = 0x10; // historical
  const unsigned long SHOW_ENTITY = 0x20; // historical
  const unsigned long SHOW_PROCESSING_INSTRUCTION = 0x40;
  const unsigned long SHOW_COMMENT = 0x80;
  const unsigned long SHOW_DOCUMENT = 0x100;
  const unsigned long SHOW_DOCUMENT_TYPE = 0x200;
  const unsigned long SHOW_DOCUMENT_FRAGMENT = 0x400;
  const unsigned long SHOW_NOTATION = 0x800; // historical

  unsigned short acceptNode(Node node);
};

interface DOMTokenList {
  readonly attribute unsigned long length;
  getter DOMString? item(unsigned long index);
  boolean contains(DOMString token);
  [CEReactions] void add(DOMString... tokens);
  [CEReactions] void remove(DOMString... tokens);
  [CEReactions] boolean toggle(DOMString token, optional boolean force);
  [CEReactions] void replace(DOMString token, DOMString newToken);
  boolean supports(DOMString token);
  [CEReactions] stringifier attribute DOMString value;
  iterable<DOMString>;
};

[Exposed=(Window,Worker)]
interface PerformanceEntry {
    readonly    attribute DOMString           name;
    readonly    attribute DOMString           entryType;
    readonly    attribute DOMHighResTimeStamp startTime;
    readonly    attribute DOMHighResTimeStamp duration;
    serializer = {attribute};
};
partial interface Performance {
    PerformanceEntryList getEntries ();
    PerformanceEntryList getEntriesByType (DOMString type);
    PerformanceEntryList getEntriesByName (DOMString name, optional DOMString type);
};
typedef sequence<PerformanceEntry> PerformanceEntryList;
dictionary PerformanceObserverInit {
  required sequence<DOMString> entryTypes;
};

[Exposed=(Window,Worker)]
interface PerformanceObserverEntryList {
  PerformanceEntryList getEntries ();
  PerformanceEntryList getEntriesByType (DOMString type);
  PerformanceEntryList getEntriesByName (DOMString name, optional DOMString type);
};

callback PerformanceObserverCallback = void (PerformanceObserverEntryList entries,
                                             PerformanceObserver observer);

[Constructor(PerformanceObserverCallback callback), Exposed=(Window,Worker)]
interface PerformanceObserver {
  void observe (PerformanceObserverInit options);
  void disconnect ();
};
dictionary PermissionDescriptor {
  required PermissionName name;
};

enum PermissionState {
  "granted",
  "denied",
  "prompt",
};

[Exposed=(Window,Worker)]
interface PermissionStatus : EventTarget {
  readonly attribute PermissionState state;
  attribute EventHandler onchange;
};

[Exposed=(Window)]
partial interface Navigator {
  readonly attribute Permissions permissions;
};

[Exposed=(Worker)]
partial interface WorkerNavigator {
  readonly attribute Permissions permissions;
};

[Exposed=(Window,Worker)]
interface Permissions {
  Promise<PermissionStatus> query(object permissionDesc);

  Promise<PermissionStatus> request(object permissionDesc);

  Promise<PermissionStatus> revoke(object permissionDesc);
};

enum PermissionName {
  "geolocation",
  "notifications",
  "push",
  "midi",
  "camera",
  "microphone",
  "speaker",
  "device-info",
  "background-sync",
  "bluetooth",
  "persistent-storage",
};

dictionary PushPermissionDescriptor : PermissionDescriptor {
  boolean userVisibleOnly = false;
};

dictionary MidiPermissionDescriptor : PermissionDescriptor {
  boolean sysex = false;
};

dictionary DevicePermissionDescriptor : PermissionDescriptor {
  DOMString deviceId;
};

dictionary PermissionDescriptor {
  required PermissionName name;
};

enum PermissionState {
  "granted",
  "denied",
  "prompt",
};

[Exposed=(Window,Worker)]
interface PermissionStatus : EventTarget {
  readonly attribute PermissionState state;
  attribute EventHandler onchange;
};

[Exposed=(Window)]
partial interface Navigator {
  readonly attribute Permissions permissions;
};

[Exposed=(Worker)]
partial interface WorkerNavigator {
  readonly attribute Permissions permissions;
};

[Exposed=(Window,Worker)]
interface Permissions {
  Promise<PermissionStatus> query(object permissionDesc);

  Promise<PermissionStatus> request(object permissionDesc);

  Promise<PermissionStatus> revoke(object permissionDesc);
};

dictionary PushPermissionDescriptor : PermissionDescriptor {
  boolean userVisibleOnly = false;
};

dictionary MidiPermissionDescriptor : PermissionDescriptor {
  boolean sysex = false;
};

dictionary DevicePermissionDescriptor : PermissionDescriptor {
  DOMString deviceId;
};
      enum VisibilityState {
        "hidden", "visible", "prerender"
      };


      partial interface Document {
        readonly attribute boolean hidden;
        readonly attribute VisibilityState visibilityState;
        attribute EventHandler onvisibilitychange;
      };

partial interface Performance {
    void mark(DOMString markName);
    void clearMarks(optional DOMString markName);

    void measure(DOMString measureName, optional DOMString startMark, optional DOMString endMark);
    void clearMeasures(optional DOMString measureName);
};


  [Exposed=(Window,Worker)]
  interface PerformanceMark : PerformanceEntry {
  };


  [Exposed=(Window,Worker)]
  interface PerformanceMeasure : PerformanceEntry {
  };

dictionary CredentialData {
  DOMString id;
};

interface Credential {
  readonly attribute DOMString id;
  readonly attribute DOMString type;
};
Credential implements Transferable;

dictionary OriginBoundCredentialData : CredentialData {
  DOMString name;
  USVString iconURL;
};

interface OriginBoundCredential : Credential {
  readonly attribute DOMString name;
  readonly attribute USVString iconURL;
};

dictionary PasswordCredentialData : OriginBoundCredentialData {
  DOMString password;
};

dictionary FormDataOptions {
  DOMString idName = "username";
  DOMString passwordName = "password";
};

[Constructor(PasswordCredentialData data), Exposed=Window]
interface PasswordCredential : OriginBoundCredential {
  FormData toFormData(optional FormDataOptions formDataOptions);
};

dictionary FederatedCredentialData : OriginBoundCredentialData {
  USVString provider;
  DOMString protocol;
};

[Constructor(FederatedCredentialData data), Exposed=Window]
interface FederatedCredential : OriginBoundCredential {
  readonly attribute USVString provider;
  readonly attribute DOMString? protocol;

  static Promise<any> registerAsProvider(DOMString protocol);
};

partial interface Navigator {
  readonly attribute CredentialContainer credentials;
};

interface CredentialContainer {
  Promise<Credential?> get(CredentialRequestOptions options);
  Promise<Credential> store(Credential credential);
  Promise<void> requireUserMediation();
};

dictionary CredentialRequestOptions {
  boolean password;
  FederatedCredentialRequestOptions federated;

  boolean suppressUI = false;
};

dictionary FederatedCredentialRequestOptions {
  sequence<USVString> providers;
  sequence<DOMString> protocols;
};

dictionary CredentialData {
  DOMString id;
};

interface Credential {
  readonly attribute DOMString id;
  readonly attribute DOMString type;
};
Credential implements Transferable;

dictionary OriginBoundCredentialData : CredentialData {
  DOMString name;
  USVString iconURL;
};

interface OriginBoundCredential : Credential {
  readonly attribute DOMString name;
  readonly attribute USVString iconURL;
};

dictionary PasswordCredentialData : OriginBoundCredentialData {
  DOMString password;
};

dictionary FormDataOptions {
  DOMString idName = "username";
  DOMString passwordName = "password";
};

[Constructor(PasswordCredentialData data), Exposed=Window]
interface PasswordCredential : OriginBoundCredential {
  FormData toFormData(optional FormDataOptions formDataOptions);
};

dictionary FederatedCredentialData : OriginBoundCredentialData {
  USVString provider;
  DOMString protocol;
};

[Constructor(FederatedCredentialData data), Exposed=Window]
interface FederatedCredential : OriginBoundCredential {
  readonly attribute USVString provider;
  readonly attribute DOMString? protocol;

  static Promise<any> registerAsProvider(DOMString protocol);
};

partial interface Navigator {
  readonly attribute CredentialContainer credentials;
};

interface CredentialContainer {
  Promise<Credential?> get(CredentialRequestOptions options);
  Promise<Credential> store(Credential credential);
  Promise<void> requireUserMediation();
};

dictionary CredentialRequestOptions {
  boolean password;
  FederatedCredentialRequestOptions federated;

  boolean suppressUI = false;
};

dictionary FederatedCredentialRequestOptions {
  sequence<USVString> providers;
  sequence<DOMString> protocols;
};


partial interface Element {
  Promise<void> requestFullscreen();
};

partial interface Document {
  [LenientSetter] readonly attribute boolean fullscreenEnabled;
  [LenientSetter] readonly attribute boolean fullscreen; // historical

  Promise<void> exitFullscreen();

  attribute EventHandler onfullscreenchange;
  attribute EventHandler onfullscreenerror;
};

partial interface DocumentOrShadowRoot {
  [LenientSetter] readonly attribute Element? fullscreenElement;
};
partial interface CSSRule {
    const unsigned short VIEWPORT_RULE = 15;
};

interface CSSViewportRule : CSSRule {
    readonly attribute CSSStyleDeclaration style;
};
[Constructor(DOMString type, optional AnimationEventInit animationEventInitDict)]
interface AnimationEvent : Event {
  readonly attribute DOMString animationName;
  readonly attribute float elapsedTime;
  readonly attribute DOMString pseudoElement;
};
dictionary AnimationEventInit : EventInit {
  DOMString animationName = "";
  float elapsedTime = 0.0;
  DOMString pseudoElement = "";
};

partial interface CSSRule {
    const unsigned short KEYFRAMES_RULE = 7;
    const unsigned short KEYFRAME_RULE = 8;
};

interface CSSKeyframeRule : CSSRule {
           attribute DOMString           keyText;
  readonly attribute CSSStyleDeclaration style;
};

interface CSSKeyframesRule : CSSRule {
           attribute DOMString   name;
  readonly attribute CSSRuleList cssRules;

  void            appendRule(DOMString rule);
  void            deleteRule(DOMString select);
  CSSKeyframeRule? findRule(DOMString select);
};

partial interface GlobalEventHandlers {
  attribute EventHandler onanimationstart;
  attribute EventHandler onanimationiteration;
  attribute EventHandler onanimationend;
  attribute EventHandler onanimationcancel;
};

[Constructor(DOMString type, optional AnimationEventInit animationEventInitDict)]
interface AnimationEvent : Event {
  readonly attribute DOMString animationName;
  readonly attribute float elapsedTime;
  readonly attribute DOMString pseudoElement;
};
dictionary AnimationEventInit : EventInit {
  DOMString animationName = "";
  float elapsedTime = 0.0;
  DOMString pseudoElement = "";
};

partial interface CSSRule {
    const unsigned short KEYFRAMES_RULE = 7;
    const unsigned short KEYFRAME_RULE = 8;
};

interface CSSKeyframeRule : CSSRule {
           attribute DOMString           keyText;
  readonly attribute CSSStyleDeclaration style;
};

interface CSSKeyframesRule : CSSRule {
           attribute DOMString   name;
  readonly attribute CSSRuleList cssRules;

  void            appendRule(DOMString rule);
  void            deleteRule(DOMString select);
  CSSKeyframeRule? findRule(DOMString select);
};

partial interface GlobalEventHandlers {
  attribute EventHandler onanimationstart;
  attribute EventHandler onanimationiteration;
  attribute EventHandler onanimationend;
  attribute EventHandler onanimationcancel;
};


[Constructor(DOMString title, optional NotificationOptions options),
 Exposed=(Window,Worker)]
interface Notification : EventTarget {
  static readonly attribute NotificationPermission permission;
  [Exposed=Window] static Promise<NotificationPermission> requestPermission(optional NotificationPermissionCallback deprecatedCallback);

  static readonly attribute unsigned long maxActions;

  attribute EventHandler onclick;
  attribute EventHandler onerror;

  readonly attribute DOMString title;
  readonly attribute NotificationDirection dir;
  readonly attribute DOMString lang;
  readonly attribute DOMString body;
  readonly attribute DOMString tag;
  readonly attribute USVString image;
  readonly attribute USVString icon;
  readonly attribute USVString badge;
  readonly attribute USVString sound;
  [SameObject] readonly attribute FrozenArray<unsigned long> vibrate;
  readonly attribute DOMTimeStamp timestamp;
  readonly attribute boolean renotify;
  readonly attribute boolean silent;
  readonly attribute boolean requireInteraction;
  [SameObject] readonly attribute any data;
  [SameObject] readonly attribute FrozenArray<NotificationAction> actions;

  void close();
};

dictionary NotificationOptions {
  NotificationDirection dir = "auto";
  DOMString lang = "";
  DOMString body = "";
  DOMString tag = "";
  USVString image;
  USVString icon;
  USVString badge;
  USVString sound;
  VibratePattern vibrate;
  DOMTimeStamp timestamp;
  boolean renotify = false;
  boolean silent = false;
  boolean requireInteraction = false;
  any data = null;
  sequence<NotificationAction> actions = [];
};

enum NotificationPermission {
  "default",
  "denied",
  "granted"
};

enum NotificationDirection {
  "auto",
  "ltr",
  "rtl"
};

dictionary NotificationAction {
  required DOMString action;
  required DOMString title;
  USVString icon;
};

callback NotificationPermissionCallback = void (NotificationPermission permission);
dictionary GetNotificationOptions {
  DOMString tag = "";
};

partial interface ServiceWorkerRegistration {
  Promise<void> showNotification(DOMString title, optional NotificationOptions options);
  Promise<sequence<Notification>> getNotifications(optional GetNotificationOptions filter);
};

[Constructor(DOMString type, NotificationEventInit eventInitDict),
 Exposed=ServiceWorker]
interface NotificationEvent : ExtendableEvent {
  readonly attribute Notification notification;
  readonly attribute DOMString action;
};

dictionary NotificationEventInit : ExtendableEventInit {
  required Notification notification;
  DOMString action = "";
};

partial interface ServiceWorkerGlobalScope {
  attribute EventHandler onnotificationclick;
  attribute EventHandler onnotificationclose;
};

[Constructor(DOMString title, optional NotificationOptions options),
 Exposed=(Window,Worker)]
interface Notification : EventTarget {
  static readonly attribute NotificationPermission permission;
  [Exposed=Window] static Promise<NotificationPermission> requestPermission(optional NotificationPermissionCallback deprecatedCallback);

  static readonly attribute unsigned long maxActions;

  attribute EventHandler onclick;
  attribute EventHandler onerror;

  readonly attribute DOMString title;
  readonly attribute NotificationDirection dir;
  readonly attribute DOMString lang;
  readonly attribute DOMString body;
  readonly attribute DOMString tag;
  readonly attribute USVString image;
  readonly attribute USVString icon;
  readonly attribute USVString badge;
  readonly attribute USVString sound;
  [SameObject] readonly attribute FrozenArray<unsigned long> vibrate;
  readonly attribute DOMTimeStamp timestamp;
  readonly attribute boolean renotify;
  readonly attribute boolean silent;
  readonly attribute boolean requireInteraction;
  [SameObject] readonly attribute any data;
  [SameObject] readonly attribute FrozenArray<NotificationAction> actions;

  void close();
};

dictionary NotificationOptions {
  NotificationDirection dir = "auto";
  DOMString lang = "";
  DOMString body = "";
  DOMString tag = "";
  USVString image;
  USVString icon;
  USVString badge;
  USVString sound;
  VibratePattern vibrate;
  DOMTimeStamp timestamp;
  boolean renotify = false;
  boolean silent = false;
  boolean requireInteraction = false;
  any data = null;
  sequence<NotificationAction> actions = [];
};

enum NotificationPermission {
  "default",
  "denied",
  "granted"
};

enum NotificationDirection {
  "auto",
  "ltr",
  "rtl"
};

dictionary NotificationAction {
  required DOMString action;
  required DOMString title;
  USVString icon;
};

callback NotificationPermissionCallback = void (NotificationPermission permission);

dictionary GetNotificationOptions {
  DOMString tag = "";
};

partial interface ServiceWorkerRegistration {
  Promise<void> showNotification(DOMString title, optional NotificationOptions options);
  Promise<sequence<Notification>> getNotifications(optional GetNotificationOptions filter);
};

[Constructor(DOMString type, NotificationEventInit eventInitDict),
 Exposed=ServiceWorker]
interface NotificationEvent : ExtendableEvent {
  readonly attribute Notification notification;
  readonly attribute DOMString action;
};

dictionary NotificationEventInit : ExtendableEventInit {
  required Notification notification;
  DOMString action = "";
};

partial interface ServiceWorkerGlobalScope {
  attribute EventHandler onnotificationclick;
  attribute EventHandler onnotificationclose;
};


dictionary RTCConfiguration {
    sequence<RTCIceServer>   iceServers;
    RTCIceTransportPolicy    iceTransportPolicy = "all";
    RTCBundlePolicy          bundlePolicy = "balanced";
    RTCRtcpMuxPolicy         rtcpMuxPolicy = "require";
    DOMString                peerIdentity;
    sequence<RTCCertificate> certificates;
    unsigned short           iceCandidatePoolSize = 0;
};
enum RTCIceCredentialType {
    "password",
    "token"
};
dictionary RTCIceServer {
    required (DOMString or sequence<DOMString>) urls;
             DOMString                          username;
             DOMString                          credential;
             RTCIceCredentialType               credentialType = "password";
};
enum RTCIceTransportPolicy {
    "relay",
    "all"
};
enum RTCBundlePolicy {
    "balanced",
    "max-compat",
    "max-bundle"
};
enum RTCRtcpMuxPolicy {
    "negotiate",
    "require"
};
dictionary RTCOfferAnswerOptions {
    boolean voiceActivityDetection = true;
};
dictionary RTCOfferOptions : RTCOfferAnswerOptions {
    boolean iceRestart = false;
};
dictionary RTCAnswerOptions : RTCOfferAnswerOptions {
};
[Constructor(optional RTCConfiguration configuration)]
interface RTCPeerConnection : EventTarget {
    Promise<RTCSessionDescriptionInit> createOffer(optional RTCOfferOptions options);
    Promise<RTCSessionDescriptionInit> createAnswer(optional RTCAnswerOptions options);
    Promise<void>                      setLocalDescription(RTCSessionDescriptionInit description);
    readonly        attribute RTCSessionDescription?    localDescription;
    readonly        attribute RTCSessionDescription?    currentLocalDescription;
    readonly        attribute RTCSessionDescription?    pendingLocalDescription;
    Promise<void>                      setRemoteDescription(RTCSessionDescriptionInit description);
    readonly        attribute RTCSessionDescription?    remoteDescription;
    readonly        attribute RTCSessionDescription?    currentRemoteDescription;
    readonly        attribute RTCSessionDescription?    pendingRemoteDescription;
    Promise<void>                      addIceCandidate((RTCIceCandidateInit or RTCIceCandidate) candidate);
    readonly        attribute RTCSignalingState         signalingState;
    readonly        attribute RTCIceGatheringState      iceGatheringState;
    readonly        attribute RTCIceConnectionState     iceConnectionState;
    readonly        attribute RTCPeerConnectionState    connectionState;
    readonly        attribute boolean?                  canTrickleIceCandidates;
    static readonly attribute FrozenArray<RTCIceServer> defaultIceServers;
    RTCConfiguration                   getConfiguration();
    void                               setConfiguration(RTCConfiguration configuration);
    void                               close();
                    attribute EventHandler              onnegotiationneeded;
                    attribute EventHandler              onicecandidate;
                    attribute EventHandler              onicecandidateerror;
                    attribute EventHandler              onsignalingstatechange;
                    attribute EventHandler              oniceconnectionstatechange;
                    attribute EventHandler              onicegatheringstatechange;
                    attribute EventHandler              onconnectionstatechange;
                    attribute EventHandler              onfingerprintfailure;
};
partial interface RTCPeerConnection {
    Promise<void> createOffer(RTCSessionDescriptionCallback successCallback,
                              RTCPeerConnectionErrorCallback failureCallback,
                              optional RTCOfferOptions options);
    Promise<void> setLocalDescription(RTCSessionDescriptionInit description,
                                      VoidFunction successCallback,
                                      RTCPeerConnectionErrorCallback failureCallback);
    Promise<void> createAnswer(RTCSessionDescriptionCallback successCallback,
                               RTCPeerConnectionErrorCallback failureCallback);
    Promise<void> setRemoteDescription(RTCSessionDescriptionInit description,
                                       VoidFunction successCallback,
                                       RTCPeerConnectionErrorCallback failureCallback);
    Promise<void> addIceCandidate((RTCIceCandidateInit or RTCIceCandidate) candidate,
                                  VoidFunction successCallback,
                                  RTCPeerConnectionErrorCallback failureCallback);
    Promise<void> getStats(MediaStreamTrack? selector,
                           RTCStatsCallback successCallback,
                           RTCPeerConnectionErrorCallback failureCallback);
};
enum RTCSignalingState {
    "stable",
    "have-local-offer",
    "have-remote-offer",
    "have-local-pranswer",
    "have-remote-pranswer"
};
enum RTCIceGatheringState {
    "new",
    "gathering",
    "complete"
};
enum RTCPeerConnectionState {
    "new",
    "connecting",
    "connected",
    "disconnected",
    "failed",
    "closed"
};
enum RTCIceConnectionState {
    "new",
    "checking",
    "connected",
    "completed",
    "failed",
    "disconnected",
    "closed"
};
callback RTCPeerConnectionErrorCallback = void (DOMException error);
callback RTCSessionDescriptionCallback = void (RTCSessionDescriptionInit description);
callback RTCStatsCallback = void (RTCStatsReport report);
enum RTCSdpType {
    "offer",
    "pranswer",
    "answer",
    "rollback"
};
[Constructor(RTCSessionDescriptionInit descriptionInitDict)]
interface RTCSessionDescription {
    readonly attribute RTCSdpType type;
    readonly attribute DOMString  sdp;
    serializer = {attribute};
};
dictionary RTCSessionDescriptionInit {
    required RTCSdpType type;
             DOMString  sdp = "";
};
[Constructor(RTCIceCandidateInit candidateInitDict)]
interface RTCIceCandidate {
    readonly attribute DOMString               candidate;
    readonly attribute DOMString?              sdpMid;
    readonly attribute unsigned short?         sdpMLineIndex;
    readonly attribute DOMString?              foundation;
    readonly attribute unsigned long?          priority;
    readonly attribute DOMString?              ip;
    readonly attribute RTCIceProtocol?         protocol;
    readonly attribute unsigned short?         port;
    readonly attribute RTCIceCandidateType?    type;
    readonly attribute RTCIceTcpCandidateType? tcpType;
    readonly attribute DOMString?              relatedAddress;
    readonly attribute unsigned short?         relatedPort;
    readonly attribute DOMString               ufrag;
    serializer = {candidate, sdpMid, sdpMLineIndex, ufrag};
};
dictionary RTCIceCandidateInit {
             DOMString       candidate = "";
             DOMString?      sdpMid = null;
             unsigned short? sdpMLineIndex = null;
    required DOMString       ufrag;
};
enum RTCIceProtocol {
    "udp",
    "tcp"
};
enum RTCIceTcpCandidateType {
    "active",
    "passive",
    "so"
};
enum RTCIceCandidateType {
    "host",
    "srflx",
    "prflx",
    "relay"
};
[Constructor(DOMString type, optional RTCPeerConnectionIceEventInit eventInitDict)]
interface RTCPeerConnectionIceEvent : Event {
    readonly attribute RTCIceCandidate? candidate;
    readonly attribute DOMString?       url;
};
dictionary RTCPeerConnectionIceEventInit : EventInit {
    RTCIceCandidate? candidate;
    DOMString?       url;
};
[Constructor(DOMString type, RTCPeerConnectionIceErrorEventInit eventInitDict)]
interface RTCPeerConnectionIceErrorEvent : Event {
    readonly attribute DOMString      hostCandidate;
    readonly attribute DOMString      url;
    readonly attribute unsigned short errorCode;
    readonly attribute USVString      errorText;
};
dictionary RTCPeerConnectionIceErrorEventInit : EventInit {
    DOMString      hostCandidate;
    DOMString      url;
    unsigned short errorCode;
    USVString      statusText;
};
enum RTCPriorityType {
    "very-low",
    "low",
    "medium",
    "high"
};
partial interface RTCPeerConnection {
    static Promise<RTCCertificate> generateCertificate(AlgorithmIdentifier keygenAlgorithm);
};
dictionary RTCCertificateExpiration {
    [EnforceRange]
    DOMTimeStamp expires;
};
interface RTCCertificate {
    readonly attribute DOMTimeStamp                    expires;
    readonly attribute FrozenArray<RTCDtlsFingerprint> fingerprints;
    AlgorithmIdentifier getAlgorithm();
};
partial interface RTCPeerConnection {
    sequence<RTCRtpSender>      getSenders();
    sequence<RTCRtpReceiver>    getReceivers();
    sequence<RTCRtpTransceiver> getTransceivers();
    RTCRtpSender                addTrack(MediaStreamTrack track,
                                         MediaStream... streams);
    void                        removeTrack(RTCRtpSender sender);
    RTCRtpTransceiver           addTransceiver((MediaStreamTrack or DOMString) trackOrKind,
                                               optional RTCRtpTransceiverInit init);
    attribute EventHandler ontrack;
};
dictionary RTCRtpTransceiverInit {
    RTCRtpTransceiverDirection         direction = "sendrecv";
    sequence<MediaStream>              streams;
    sequence<RTCRtpEncodingParameters> sendEncodings;
};
enum RTCRtpTransceiverDirection {
    "sendrecv",
    "sendonly",
    "recvonly",
    "inactive"
};
interface RTCRtpSender {
    readonly attribute MediaStreamTrack? track;
    readonly attribute RTCDtlsTransport? transport;
    readonly attribute RTCDtlsTransport? rtcpTransport;
    static RTCRtpCapabilities getCapabilities(DOMString kind);
    Promise<void>      setParameters(optional RTCRtpParameters parameters);
    RTCRtpParameters   getParameters();
    Promise<void>      replaceTrack(MediaStreamTrack withTrack);
};
dictionary RTCRtpParameters {
    DOMString                                 transactionId;
    sequence<RTCRtpEncodingParameters>        encodings;
    sequence<RTCRtpHeaderExtensionParameters> headerExtensions;
    RTCRtcpParameters                         rtcp;
    sequence<RTCRtpCodecParameters>           codecs;
    RTCDegradationPreference                  degradationPreference = "balanced";
};
dictionary RTCRtpEncodingParameters {
    unsigned long       ssrc;
    RTCRtpRtxParameters rtx;
    RTCRtpFecParameters fec;
    RTCDtxStatus        dtx;
    boolean             active;
    RTCPriorityType     priority;
    unsigned long       maxBitrate;
    unsigned long       maxFramerate;
    DOMString           rid;
    double              scaleResolutionDownBy = 1;
};
enum RTCDtxStatus {
    "disabled",
    "enabled"
};
enum RTCDegradationPreference {
    "maintain-framerate",
    "maintain-resolution",
    "balanced"
};
dictionary RTCRtpRtxParameters {
    unsigned long ssrc;
};
dictionary RTCRtpFecParameters {
    unsigned long ssrc;
};
dictionary RTCRtcpParameters {
    DOMString cname;
    boolean   reducedSize;
};
dictionary RTCRtpHeaderExtensionParameters {
    DOMString      uri;
    unsigned short id;
    boolean        encrypted;
};
dictionary RTCRtpCodecParameters {
    unsigned short payloadType;
    DOMString      mimeType;
    unsigned long  clockRate;
    unsigned short channels = 1;
    DOMString      sdpFmtpLine;
};
dictionary RTCRtpCapabilities {
    sequence<RTCRtpCodecCapability>           codecs;
    sequence<RTCRtpHeaderExtensionCapability> headerExtensions;
};
dictionary RTCRtpCodecCapability {
    DOMString mimeType;
};
dictionary RTCRtpHeaderExtensionCapability {
    DOMString uri;
};
interface RTCRtpReceiver {
    readonly attribute MediaStreamTrack  track;
    readonly attribute RTCDtlsTransport? transport;
    readonly attribute RTCDtlsTransport? rtcpTransport;
    static RTCRtpCapabilities          getCapabilities(DOMString kind);
    RTCRtpParameters                   getParameters();
    sequence<RTCRtpContributingSource> getContributingSources();
};
interface RTCRtpContributingSource {
    readonly attribute DOMHighResTimeStamp timestamp;
    readonly attribute unsigned long       source;
    readonly attribute byte?               audioLevel;
    readonly attribute boolean?            voiceActivityFlag;
};
interface RTCRtpTransceiver {
    readonly attribute DOMString?                  mid;
    [SameObject]
    readonly attribute RTCRtpSender                sender;
    [SameObject]
    readonly attribute RTCRtpReceiver              receiver;
    readonly attribute boolean                     stopped;
    readonly attribute RTCRtpTransceiverDirection  direction;
    readonly attribute RTCRtpTransceiverDirection? currentDirection;
    void setDirection(RTCRtpTransceiverDirection direction);
    void stop();
    void setCodecPreferences(sequence<RTCRtpCodecCapability> codecs);
};
interface RTCDtlsTransport {
    readonly attribute RTCIceTransport       transport;
    readonly attribute RTCDtlsTransportState state;
    sequence<ArrayBuffer> getRemoteCertificates();
             attribute EventHandler          onstatechange;
};
enum RTCDtlsTransportState {
    "new",
    "connecting",
    "connected",
    "closed",
    "failed"
};
dictionary RTCDtlsFingerprint {
    DOMString algorithm;
    DOMString value;
};
interface RTCIceTransport {
    readonly attribute RTCIceRole           role;
    readonly attribute RTCIceComponent      component;
    readonly attribute RTCIceTransportState state;
    readonly attribute RTCIceGathererState  gatheringState;
    sequence<RTCIceCandidate> getLocalCandidates();
    sequence<RTCIceCandidate> getRemoteCandidates();
    RTCIceCandidatePair?      getSelectedCandidatePair();
    RTCIceParameters?         getLocalParameters();
    RTCIceParameters?         getRemoteParameters();
             attribute EventHandler         onstatechange;
             attribute EventHandler         ongatheringstatechange;
             attribute EventHandler         onselectedcandidatepairchange;
};
dictionary RTCIceParameters {
    DOMString usernameFragment;
    DOMString password;
};
dictionary RTCIceCandidatePair {
    RTCIceCandidate local;
    RTCIceCandidate remote;
};
enum RTCIceGathererState {
    "new",
    "gathering",
    "complete"
};
enum RTCIceTransportState {
    "new",
    "checking",
    "connected",
    "completed",
    "failed",
    "disconnected",
    "closed"
};
enum RTCIceRole {
    "controlling",
    "controlled"
};
enum RTCIceComponent {
    "RTP",
    "RTCP"
};
[Constructor(DOMString type, RTCTrackEventInit eventInitDict)]
interface RTCTrackEvent : Event {
    readonly attribute RTCRtpReceiver           receiver;
    readonly attribute MediaStreamTrack         track;
    readonly attribute FrozenArray<MediaStream> streams;
    readonly attribute RTCRtpTransceiver        transceiver;
};
dictionary RTCTrackEventInit : EventInit {
    required RTCRtpReceiver        receiver;
    required MediaStreamTrack      track;
             sequence<MediaStream> streams = [];
    required RTCRtpTransceiver     transceiver;
};
partial interface RTCPeerConnection {
    readonly attribute RTCSctpTransport? sctp;
    RTCDataChannel createDataChannel([TreatNullAs=EmptyString] USVString label,
                                     optional RTCDataChannelInit dataChannelDict);
             attribute EventHandler      ondatachannel;
};
interface RTCSctpTransport {
    readonly attribute RTCDtlsTransport transport;
    readonly attribute unsigned long    maxMessageSize;
};
interface RTCDataChannel : EventTarget {
    readonly attribute USVString           label;
    readonly attribute boolean             ordered;
    readonly attribute unsigned short?     maxPacketLifeTime;
    readonly attribute unsigned short?     maxRetransmits;
    readonly attribute USVString           protocol;
    readonly attribute boolean             negotiated;
    readonly attribute unsigned short      id;
    readonly attribute RTCPriorityType     priority;
    readonly attribute RTCDataChannelState readyState;
    readonly attribute unsigned long       bufferedAmount;
             attribute unsigned long       bufferedAmountLowThreshold;
             attribute EventHandler        onopen;
             attribute EventHandler        onbufferedamountlow;
             attribute EventHandler        onerror;
             attribute EventHandler        onclose;
    void close();
             attribute EventHandler        onmessage;
             attribute DOMString           binaryType;
    void send(USVString data);
    void send(Blob data);
    void send(ArrayBuffer data);
    void send(ArrayBufferView data);
};
dictionary RTCDataChannelInit {
    boolean         ordered = true;
    unsigned short  maxPacketLifeTime;
    unsigned short  maxRetransmits;
    USVString       protocol = "";
    boolean         negotiated = false;
    unsigned short  id;
    RTCPriorityType priority = "low";
};
enum RTCDataChannelState {
    "connecting",
    "open",
    "closing",
    "closed"
};
[Constructor(DOMString type, RTCDataChannelEventInit eventInitDict)]
interface RTCDataChannelEvent : Event {
    readonly attribute RTCDataChannel channel;
};
dictionary RTCDataChannelEventInit : EventInit {
    required RTCDataChannel channel;
};
partial interface RTCRtpSender {
    readonly attribute RTCDTMFSender? dtmf;
};
interface RTCDTMFSender : EventTarget {
    void insertDTMF(DOMString tones,
                    optional unsigned long duration = 100,
                    optional unsigned long interToneGap = 70);
             attribute EventHandler ontonechange;
    readonly attribute DOMString    toneBuffer;
};
[Constructor(DOMString type, RTCDTMFToneChangeEventInit eventInitDict)]
interface RTCDTMFToneChangeEvent : Event {
    readonly attribute DOMString tone;
};
dictionary RTCDTMFToneChangeEventInit : EventInit {
    required DOMString tone;
};
partial interface RTCPeerConnection {
    Promise<RTCStatsReport> getStats(optional MediaStreamTrack? selector = null);
};
interface RTCStatsReport {
    readonly maplike<DOMString, object>;
};
dictionary RTCStats {
    DOMHighResTimeStamp timestamp;
    RTCStatsType        type;
    DOMString           id;
};
enum RTCStatsType {
};
[Global,
 Exposed=RTCIdentityProviderGlobalScope]
interface RTCIdentityProviderGlobalScope : WorkerGlobalScope {
    readonly attribute RTCIdentityProviderRegistrar rtcIdentityProvider;
};
[Exposed=RTCIdentityProviderGlobalScope]
interface RTCIdentityProviderRegistrar {
    void register(RTCIdentityProvider idp);
};
dictionary RTCIdentityProvider {
    required GenerateAssertionCallback generateAssertion;
    required ValidateAssertionCallback validateAssertion;
};
callback GenerateAssertionCallback = Promise<RTCIdentityAssertionResult> (DOMString contents,
                                                                          DOMString origin,
                                                                          RTCIdentityProviderOptions options);
callback ValidateAssertionCallback = Promise<RTCIdentityValidationResult> (DOMString assertion,
                                                                           DOMString origin);
dictionary RTCIdentityAssertionResult {
    required RTCIdentityProviderDetails idp;
    required DOMString                  assertion;
};
dictionary RTCIdentityProviderDetails {
    required DOMString domain;
             DOMString protocol = "default";
};
dictionary RTCIdentityValidationResult {
    required DOMString identity;
    required DOMString contents;
};
partial interface RTCPeerConnection {
    void               setIdentityProvider(DOMString provider,
                                           optional RTCIdentityProviderOptions options);
    Promise<DOMString> getIdentityAssertion();
    readonly attribute Promise<RTCIdentityAssertion> peerIdentity;
    readonly attribute DOMString?                    idpLoginUrl;
};
dictionary RTCIdentityProviderOptions {
    DOMString protocol = "default";
    DOMString usernameHint;
    DOMString peerIdentity;
};
[Constructor(DOMString idp, DOMString name)]
interface RTCIdentityAssertion {
    attribute DOMString idp;
    attribute DOMString name;
};
partial dictionary MediaStreamConstraints {
    DOMString peerIdentity;
};
partial interface MediaStreamTrack {
    readonly attribute boolean      isolated;
             attribute EventHandler onisolationchange;
};
[Exposed=Window,
 Constructor(DOMString type, RTCErrorEventInit eventInitDict)]
interface RTCErrorEvent : Event {
    readonly attribute RTCError? error;
};
dictionary RTCErrorEventInit : EventInit {
    RTCError? error = null;
};

[Constructor(optional HeadersInit init),
 Exposed=(Window,Worker)]
interface Headers {
  void append(ByteString name, ByteString value);
  void delete(ByteString name);
  ByteString? get(ByteString name);
  boolean has(ByteString name);
  void set(ByteString name, ByteString value);
  iterable<ByteString, ByteString>;
};
typedef (Blob or BufferSource or FormData or URLSearchParams or USVString) BodyInit;

typedef (BodyInit or ReadableStream) ResponseBodyInit;
[NoInterfaceObject, Exposed=(Window,Worker)]
interface Body {
  readonly attribute boolean bodyUsed;
  [NewObject] Promise<ArrayBuffer> arrayBuffer();
  [NewObject] Promise<Blob> blob();
  [NewObject] Promise<FormData> formData();
  [NewObject] Promise<any> json();
  [NewObject] Promise<USVString> text();
};
typedef (Request or USVString) RequestInfo;

[Constructor(RequestInfo input, optional RequestInit init),
 Exposed=(Window,Worker)]
interface Request {
  readonly attribute ByteString method;
  readonly attribute USVString url;
  [SameObject] readonly attribute Headers headers;

  readonly attribute RequestType type;
  readonly attribute RequestDestination destination;
  readonly attribute USVString referrer;
  readonly attribute ReferrerPolicy referrerPolicy;
  readonly attribute RequestMode mode;
  readonly attribute RequestCredentials credentials;
  readonly attribute RequestCache cache;
  readonly attribute RequestRedirect redirect;
  readonly attribute DOMString integrity;
  readonly attribute boolean keepalive;

  [NewObject] Request clone();
};
Request implements Body;
dictionary RequestInit {
  ByteString method;
  HeadersInit headers;
  BodyInit? body;
  USVString referrer;
  ReferrerPolicy referrerPolicy;
  RequestMode mode;
  RequestCredentials credentials;
  RequestCache cache;
  RequestRedirect redirect;
  DOMString integrity;
  boolean keepalive;
  any window; // can only be set to null
};

enum RequestType { "", "audio", "font", "image", "script", "style", "track", "video" };
enum RequestDestination { "", "document", "embed", "font", "image", "manifest", "media", "object", "report", "script", "serviceworker", "sharedworker", "style",  "worker", "xslt" };
enum RequestMode { "navigate", "same-origin", "no-cors", "cors" };
enum RequestCredentials { "omit", "same-origin", "include" };
enum RequestCache { "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached" };
enum RequestRedirect { "follow", "error", "manual" };
[Constructor(optional ResponseBodyInit? body = null, optional ResponseInit init), Exposed=(Window,Worker)]
interface Response {
  [NewObject] static Response error();
  [NewObject] static Response redirect(USVString url, optional unsigned short status = 302);

  readonly attribute ResponseType type;

  readonly attribute USVString url;
  readonly attribute boolean redirected;
  readonly attribute unsigned short status;
  readonly attribute boolean ok;
  readonly attribute ByteString statusText;
  [SameObject] readonly attribute Headers headers;
  readonly attribute ReadableStream? body;
  [SameObject] readonly attribute Promise<Headers> trailer;

  [NewObject] Response clone();
};
Response implements Body;

dictionary ResponseInit {
  unsigned short status = 200;
  ByteString statusText = "OK";
  HeadersInit headers;
};

enum ResponseType { "basic", "cors", "default", "error", "opaque", "opaqueredirect" };
partial interface WindowOrWorkerGlobalScope {  [NewObject] Promise<Response> fetch(RequestInfo input, optional RequestInit init);
};
[Constructor(optional sequence<BlobPart> blobParts, optional BlobPropertyBag options),
Exposed=(Window,Worker)]
interface Blob {

  readonly attribute unsigned long long size;
  readonly attribute DOMString type;
  readonly attribute boolean isClosed;

  //slice Blob into byte-ranged chunks

  Blob slice([Clamp] optional long long start,
            [Clamp] optional long long end,
            optional DOMString contentType);
  void close();

};

dictionary BlobPropertyBag {
  DOMString type = "";
};

typedef (BufferSource or Blob or USVString) BlobPart;

[Constructor(sequence<BlobPart> fileBits,
            [EnsureUTF16] DOMString fileName,
            optional FilePropertyBag options),
Exposed=(Window,Worker)]
interface File : Blob {
  readonly attribute DOMString name;
  readonly attribute long long lastModified;
};

dictionary FilePropertyBag : BlobPropertyBag {
  long long lastModified;
};

[Exposed=(Window,Worker)]
interface FileList {
  getter File? item(unsigned long index);
  readonly attribute unsigned long length;
};

[Constructor, Exposed=(Window,Worker)]
interface FileReader: EventTarget {

  // async read methods
  void readAsArrayBuffer(Blob blob);
  void readAsBinaryString(Blob blob);
  void readAsText(Blob blob, optional DOMString label);
  void readAsDataURL(Blob blob);

  void abort();

  // states
  const unsigned short EMPTY = 0;
  const unsigned short LOADING = 1;
  const unsigned short DONE = 2;


  readonly attribute unsigned short readyState;

  // File or Blob data
  readonly attribute (DOMString or ArrayBuffer)? result;

  readonly attribute DOMError? error;

  // event handler content attributes
  attribute EventHandler onloadstart;
  attribute EventHandler onprogress;
  attribute EventHandler onload;
  attribute EventHandler onabort;
  attribute EventHandler onerror;
  attribute EventHandler onloadend;

};

[Constructor, Exposed=Worker]
interface FileReaderSync {
  // Synchronously return strings

  ArrayBuffer readAsArrayBuffer(Blob blob);
  DOMString readAsBinaryString(Blob blob);
  DOMString readAsText(Blob blob, optional DOMString label);
  DOMString readAsDataURL(Blob blob);
};

[Exposed=(Window,DedicatedWorker,SharedWorker)]
partial interface URL {
  static DOMString createObjectURL(Blob blob);
  static DOMString createFor(Blob blob);
  static void revokeObjectURL(DOMString url);
};
[Constructor(optional sequence<BlobPart> blobParts, optional BlobPropertyBag options),
Exposed=(Window,Worker)]
interface Blob {

  readonly attribute unsigned long long size;
  readonly attribute DOMString type;
  readonly attribute boolean isClosed;

  //slice Blob into byte-ranged chunks

  Blob slice([Clamp] optional long long start,
            [Clamp] optional long long end,
            optional DOMString contentType);
  void close();

};

dictionary BlobPropertyBag {
  DOMString type = "";
};

typedef (BufferSource or Blob or USVString) BlobPart;

[Constructor(sequence<BlobPart> fileBits,
            [EnsureUTF16] DOMString fileName,
            optional FilePropertyBag options),
Exposed=(Window,Worker)]
interface File : Blob {
  readonly attribute DOMString name;
  readonly attribute long long lastModified;
};

dictionary FilePropertyBag : BlobPropertyBag {
  long long lastModified;
};

[Exposed=(Window,Worker)]
interface FileList {
  getter File? item(unsigned long index);
  readonly attribute unsigned long length;
};

[Constructor, Exposed=(Window,Worker)]
interface FileReader: EventTarget {

  // async read methods
  void readAsArrayBuffer(Blob blob);
  void readAsBinaryString(Blob blob);
  void readAsText(Blob blob, optional DOMString label);
  void readAsDataURL(Blob blob);

  void abort();

  // states
  const unsigned short EMPTY = 0;
  const unsigned short LOADING = 1;
  const unsigned short DONE = 2;


  readonly attribute unsigned short readyState;

  // File or Blob data
  readonly attribute (DOMString or ArrayBuffer)? result;

  readonly attribute DOMError? error;

  // event handler content attributes
  attribute EventHandler onloadstart;
  attribute EventHandler onprogress;
  attribute EventHandler onload;
  attribute EventHandler onabort;
  attribute EventHandler onerror;
  attribute EventHandler onloadend;

};

[Constructor, Exposed=Worker]
interface FileReaderSync {
  // Synchronously return strings

  ArrayBuffer readAsArrayBuffer(Blob blob);
  DOMString readAsBinaryString(Blob blob);
  DOMString readAsText(Blob blob, optional DOMString label);
  DOMString readAsDataURL(Blob blob);
};

[Exposed=(Window,DedicatedWorker,SharedWorker)]
partial interface URL {
  static DOMString createObjectURL(Blob blob);
  static DOMString createFor(Blob blob);
  static void revokeObjectURL(DOMString url);
};


dictionary BluetoothDataFilterInit {
  BufferSource dataPrefix;
  BufferSource mask;
};
dictionary BluetoothLEScanFilterInit {
  sequence<BluetoothServiceUUID> services;
  DOMString name;
  DOMString namePrefix;
  // Maps unsigned shorts to BluetoothDataFilters.
  object manufacturerData;
  // Maps BluetoothServiceUUIDs to BluetoothDataFilters.
  object serviceData;
};

dictionary RequestDeviceOptions {
  sequence<BluetoothLEScanFilterInit> filters;
  sequence<BluetoothServiceUUID> optionalServices = [];
  boolean acceptAllDevices = false;
};

interface Bluetooth : EventTarget {
  [SecureContext]
  Promise<boolean> getAvailability();
  [SecureContext]
  attribute EventHandler onavailabilitychanged;
  [SecureContext]
  readonly attribute BluetoothDevice? referringDevice;
  [SecureContext]
  Promise<BluetoothDevice> requestDevice(optional RequestDeviceOptions options);
};
Bluetooth implements BluetoothDeviceEventHandlers;
Bluetooth implements CharacteristicEventHandlers;
Bluetooth implements ServiceEventHandlers;

dictionary BluetoothPermissionDescriptor : PermissionDescriptor {
  DOMString deviceId;
  // These match RequestDeviceOptions.
  sequence<BluetoothLEScanFilterInit> filters;
  sequence<BluetoothServiceUUID> optionalServices = [];
  boolean acceptAllDevices = false;
};

dictionary AllowedBluetoothDevice {
  required DOMString deviceId;
  required boolean mayUseGATT;
  // An allowedServices of "all" means all services are allowed.
  required (DOMString or sequence<UUID>) allowedServices;
};

interface BluetoothPermissionResult : PermissionStatus {
  attribute FrozenArray<BluetoothDevice> devices;
};

[Constructor(DOMString type, optional ValueEventInit initDict)]
interface ValueEvent : Event {
  readonly attribute any value;
};

dictionary ValueEventInit : EventInit {
  any value = null;
};

interface BluetoothDevice {
  readonly attribute DOMString id;
  readonly attribute DOMString? name;
  readonly attribute BluetoothRemoteGATTServer? gatt;

  Promise<void> watchAdvertisements();
  void unwatchAdvertisements();
  readonly attribute boolean watchingAdvertisements;
};
BluetoothDevice implements EventTarget;
BluetoothDevice implements BluetoothDeviceEventHandlers;
BluetoothDevice implements CharacteristicEventHandlers;
BluetoothDevice implements ServiceEventHandlers;

interface BluetoothManufacturerDataMap {
  readonly maplike<unsigned short, DataView>;
};
interface BluetoothServiceDataMap {
  readonly maplike<UUID, DataView>;
};
[Constructor(DOMString type, BluetoothAdvertisingEventInit init)]
interface BluetoothAdvertisingEvent : Event {
  readonly attribute BluetoothDevice device;
  readonly attribute FrozenArray<UUID> uuids;
  readonly attribute DOMString? name;
  readonly attribute unsigned short? appearance;
  readonly attribute byte? txPower;
  readonly attribute byte? rssi;
  readonly attribute BluetoothManufacturerDataMap manufacturerData;
  readonly attribute BluetoothServiceDataMap serviceData;
};
dictionary BluetoothAdvertisingEventInit : EventInit {
  required BluetoothDevice device;
  sequence<(DOMString or unsigned long)> uuids;
  DOMString name;
  unsigned short appearance;
  byte txPower;
  byte rssi;
  Map manufacturerData;
  Map serviceData;
};

interface BluetoothRemoteGATTServer {
  readonly attribute BluetoothDevice device;
  readonly attribute boolean connected;
  Promise<BluetoothRemoteGATTServer> connect();
  void disconnect();
  Promise<BluetoothRemoteGATTService> getPrimaryService(BluetoothServiceUUID service);
  Promise<sequence<BluetoothRemoteGATTService>>
    getPrimaryServices(optional BluetoothServiceUUID service);
};

interface BluetoothRemoteGATTService {
  readonly attribute BluetoothDevice device;
  readonly attribute UUID uuid;
  readonly attribute boolean isPrimary;
  Promise<BluetoothRemoteGATTCharacteristic>
    getCharacteristic(BluetoothCharacteristicUUID characteristic);
  Promise<sequence<BluetoothRemoteGATTCharacteristic>>
    getCharacteristics(optional BluetoothCharacteristicUUID characteristic);
  Promise<BluetoothRemoteGATTService>
    getIncludedService(BluetoothServiceUUID service);
  Promise<sequence<BluetoothRemoteGATTService>>
    getIncludedServices(optional BluetoothServiceUUID service);
};
BluetoothRemoteGATTService implements EventTarget;
BluetoothRemoteGATTService implements CharacteristicEventHandlers;
BluetoothRemoteGATTService implements ServiceEventHandlers;

interface BluetoothRemoteGATTCharacteristic {
  readonly attribute BluetoothRemoteGATTService service;
  readonly attribute UUID uuid;
  readonly attribute BluetoothCharacteristicProperties properties;
  readonly attribute DataView? value;
  Promise<BluetoothRemoteGATTDescriptor> getDescriptor(BluetoothDescriptorUUID descriptor);
  Promise<sequence<BluetoothRemoteGATTDescriptor>>
    getDescriptors(optional BluetoothDescriptorUUID descriptor);
  Promise<DataView> readValue();
  Promise<void> writeValue(BufferSource value);
  Promise<BluetoothRemoteGATTCharacteristic> startNotifications();
  Promise<BluetoothRemoteGATTCharacteristic> stopNotifications();
};
BluetoothRemoteGATTCharacteristic implements EventTarget;
BluetoothRemoteGATTCharacteristic implements CharacteristicEventHandlers;

interface BluetoothCharacteristicProperties {
  readonly attribute boolean broadcast;
  readonly attribute boolean read;
  readonly attribute boolean writeWithoutResponse;
  readonly attribute boolean write;
  readonly attribute boolean notify;
  readonly attribute boolean indicate;
  readonly attribute boolean authenticatedSignedWrites;
  readonly attribute boolean reliableWrite;
  readonly attribute boolean writableAuxiliaries;
};

interface BluetoothRemoteGATTDescriptor {
  readonly attribute BluetoothRemoteGATTCharacteristic characteristic;
  readonly attribute UUID uuid;
  readonly attribute DataView? value;
  Promise<DataView> readValue();
  Promise<void> writeValue(BufferSource value);
};

[NoInterfaceObject]
interface CharacteristicEventHandlers {
  attribute EventHandler oncharacteristicvaluechanged;
};

[NoInterfaceObject]
interface BluetoothDeviceEventHandlers {
  attribute EventHandler ongattserverdisconnected;
};

[NoInterfaceObject]
interface ServiceEventHandlers {
  attribute EventHandler onserviceadded;
  attribute EventHandler onservicechanged;
  attribute EventHandler onserviceremoved;
};

typedef DOMString UUID;
interface BluetoothUUID {
  static UUID getService((DOMString or unsigned long) name);
  static UUID getCharacteristic((DOMString or unsigned long) name);
  static UUID getDescriptor((DOMString or unsigned long) name);

  static UUID canonicalUUID([EnforceRange] unsigned long alias);
};

typedef (DOMString or unsigned long) BluetoothServiceUUID;
typedef (DOMString or unsigned long) BluetoothCharacteristicUUID;
typedef (DOMString or unsigned long) BluetoothDescriptorUUID;

partial interface Navigator {
  [SameObject] readonly attribute Bluetooth bluetooth;
};

dictionary BluetoothDataFilterInit {
  BufferSource dataPrefix;
  BufferSource mask;
};
dictionary BluetoothLEScanFilterInit {
  sequence<BluetoothServiceUUID> services;
  DOMString name;
  DOMString namePrefix;
  // Maps unsigned shorts to BluetoothDataFilters.
  object manufacturerData;
  // Maps BluetoothServiceUUIDs to BluetoothDataFilters.
  object serviceData;
};

dictionary RequestDeviceOptions {
  sequence<BluetoothLEScanFilterInit> filters;
  sequence<BluetoothServiceUUID> optionalServices = [];
  boolean acceptAllDevices = false;
};

interface Bluetooth : EventTarget {
  [SecureContext]
  Promise<boolean> getAvailability();
  [SecureContext]
  attribute EventHandler onavailabilitychanged;
  [SecureContext]
  readonly attribute BluetoothDevice? referringDevice;
  [SecureContext]
  Promise<BluetoothDevice> requestDevice(optional RequestDeviceOptions options);
};
Bluetooth implements BluetoothDeviceEventHandlers;
Bluetooth implements CharacteristicEventHandlers;
Bluetooth implements ServiceEventHandlers;

dictionary BluetoothPermissionDescriptor : PermissionDescriptor {
  DOMString deviceId;
  // These match RequestDeviceOptions.
  sequence<BluetoothLEScanFilterInit> filters;
  sequence<BluetoothServiceUUID> optionalServices = [];
  boolean acceptAllDevices = false;
};

dictionary AllowedBluetoothDevice {
  required DOMString deviceId;
  required boolean mayUseGATT;
  // An allowedServices of "all" means all services are allowed.
  required (DOMString or sequence<UUID>) allowedServices;
};

interface BluetoothPermissionResult : PermissionStatus {
  attribute FrozenArray<BluetoothDevice> devices;
};

[Constructor(DOMString type, optional ValueEventInit initDict)]
interface ValueEvent : Event {
  readonly attribute any value;
};

dictionary ValueEventInit : EventInit {
  any value = null;
};

interface BluetoothDevice {
  readonly attribute DOMString id;
  readonly attribute DOMString? name;
  readonly attribute BluetoothRemoteGATTServer? gatt;

  Promise<void> watchAdvertisements();
  void unwatchAdvertisements();
  readonly attribute boolean watchingAdvertisements;
};
BluetoothDevice implements EventTarget;
BluetoothDevice implements BluetoothDeviceEventHandlers;
BluetoothDevice implements CharacteristicEventHandlers;
BluetoothDevice implements ServiceEventHandlers;

interface BluetoothManufacturerDataMap {
  readonly maplike<unsigned short, DataView>;
};
interface BluetoothServiceDataMap {
  readonly maplike<UUID, DataView>;
};
[Constructor(DOMString type, BluetoothAdvertisingEventInit init)]
interface BluetoothAdvertisingEvent : Event {
  readonly attribute BluetoothDevice device;
  readonly attribute FrozenArray<UUID> uuids;
  readonly attribute DOMString? name;
  readonly attribute unsigned short? appearance;
  readonly attribute byte? txPower;
  readonly attribute byte? rssi;
  readonly attribute BluetoothManufacturerDataMap manufacturerData;
  readonly attribute BluetoothServiceDataMap serviceData;
};
dictionary BluetoothAdvertisingEventInit : EventInit {
  required BluetoothDevice device;
  sequence<(DOMString or unsigned long)> uuids;
  DOMString name;
  unsigned short appearance;
  byte txPower;
  byte rssi;
  Map manufacturerData;
  Map serviceData;
};

interface BluetoothRemoteGATTServer {
  readonly attribute BluetoothDevice device;
  readonly attribute boolean connected;
  Promise<BluetoothRemoteGATTServer> connect();
  void disconnect();
  Promise<BluetoothRemoteGATTService> getPrimaryService(BluetoothServiceUUID service);
  Promise<sequence<BluetoothRemoteGATTService>>
    getPrimaryServices(optional BluetoothServiceUUID service);
};

interface BluetoothRemoteGATTService {
  readonly attribute BluetoothDevice device;
  readonly attribute UUID uuid;
  readonly attribute boolean isPrimary;
  Promise<BluetoothRemoteGATTCharacteristic>
    getCharacteristic(BluetoothCharacteristicUUID characteristic);
  Promise<sequence<BluetoothRemoteGATTCharacteristic>>
    getCharacteristics(optional BluetoothCharacteristicUUID characteristic);
  Promise<BluetoothRemoteGATTService>
    getIncludedService(BluetoothServiceUUID service);
  Promise<sequence<BluetoothRemoteGATTService>>
    getIncludedServices(optional BluetoothServiceUUID service);
};
BluetoothRemoteGATTService implements EventTarget;
BluetoothRemoteGATTService implements CharacteristicEventHandlers;
BluetoothRemoteGATTService implements ServiceEventHandlers;

interface BluetoothRemoteGATTCharacteristic {
  readonly attribute BluetoothRemoteGATTService service;
  readonly attribute UUID uuid;
  readonly attribute BluetoothCharacteristicProperties properties;
  readonly attribute DataView? value;
  Promise<BluetoothRemoteGATTDescriptor> getDescriptor(BluetoothDescriptorUUID descriptor);
  Promise<sequence<BluetoothRemoteGATTDescriptor>>
    getDescriptors(optional BluetoothDescriptorUUID descriptor);
  Promise<DataView> readValue();
  Promise<void> writeValue(BufferSource value);
  Promise<BluetoothRemoteGATTCharacteristic> startNotifications();
  Promise<BluetoothRemoteGATTCharacteristic> stopNotifications();
};
BluetoothRemoteGATTCharacteristic implements EventTarget;
BluetoothRemoteGATTCharacteristic implements CharacteristicEventHandlers;

interface BluetoothCharacteristicProperties {
  readonly attribute boolean broadcast;
  readonly attribute boolean read;
  readonly attribute boolean writeWithoutResponse;
  readonly attribute boolean write;
  readonly attribute boolean notify;
  readonly attribute boolean indicate;
  readonly attribute boolean authenticatedSignedWrites;
  readonly attribute boolean reliableWrite;
  readonly attribute boolean writableAuxiliaries;
};

interface BluetoothRemoteGATTDescriptor {
  readonly attribute BluetoothRemoteGATTCharacteristic characteristic;
  readonly attribute UUID uuid;
  readonly attribute DataView? value;
  Promise<DataView> readValue();
  Promise<void> writeValue(BufferSource value);
};

[NoInterfaceObject]
interface CharacteristicEventHandlers {
  attribute EventHandler oncharacteristicvaluechanged;
};

[NoInterfaceObject]
interface BluetoothDeviceEventHandlers {
  attribute EventHandler ongattserverdisconnected;
};

[NoInterfaceObject]
interface ServiceEventHandlers {
  attribute EventHandler onserviceadded;
  attribute EventHandler onservicechanged;
  attribute EventHandler onserviceremoved;
};

typedef DOMString UUID;
interface BluetoothUUID {
  static UUID getService((DOMString or unsigned long) name);
  static UUID getCharacteristic((DOMString or unsigned long) name);
  static UUID getDescriptor((DOMString or unsigned long) name);

  static UUID canonicalUUID([EnforceRange] unsigned long alias);
};

typedef (DOMString or unsigned long) BluetoothServiceUUID;
typedef (DOMString or unsigned long) BluetoothCharacteristicUUID;
typedef (DOMString or unsigned long) BluetoothDescriptorUUID;

partial interface Navigator {
  [SameObject] readonly attribute Bluetooth bluetooth;
};


enum ReferrerPolicy {
  "",
  "no-referrer",
  "no-referrer-when-downgrade",
  "same-origin",
  "origin",
  "strict-origin",
  "origin-when-cross-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url"
};
`;
