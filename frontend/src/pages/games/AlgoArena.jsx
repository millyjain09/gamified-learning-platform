import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios"; 
import { io } from "socket.io-client";

const LANGUAGES = [
  { id: "javascript", label: "JS",   monaco: "javascript", judge0Id: 63  },
  { id: "python",     label: "Py",   monaco: "python",     judge0Id: 71  },
  { id: "java",       label: "Java", monaco: "java",        judge0Id: 62  },
  { id: "cpp",        label: "C++",  monaco: "cpp",         judge0Id: 54  },
];

const JUDGE0_URL = "https://ce.judge0.com";
const ROUND_TIME = 5 * 60;
const ROUNDS = ["easy", "medium", "hard"];
const socket = io("http://localhost:5000");

const QUESTIONS = {
  easy: [
    {
      id: "e1", title: "Two Sum",
      description: `Given an array \`nums\` and integer \`target\`, return indices of two numbers that add up to target.`,
      examples: [
        { input: "nums=[2,7,11,15], target=9", output: "[0,1]", explanation: "2+7=9" },
        { input: "nums=[3,2,4], target=6", output: "[1,2]" },
      ],
      testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      ],
      starter: {
        javascript: `function twoSum(nums, target) {\n  // Your solution here\n}`,
        python: `def twoSum(nums, target):\n    pass`,
        java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}`,
        cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};`,
      },
      call: (i) => `return twoSum(${JSON.stringify(i.nums)},${i.target});`,
      validate: (o, e) => JSON.stringify([...(o||[])].sort((a,b)=>a-b)) === JSON.stringify([...(e||[])].sort((a,b)=>a-b)),
      toStdin: (inp) => `${inp.nums.join(' ')}\n${inp.target}`,
      wrapCode: {
        javascript: (c) => c + `\nconst lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');const nums=lines[0].split(' ').map(Number);const target=Number(lines[1]);const r=twoSum(nums,target);console.log(r.join(' '));`,
        python: (c) => c + `\nimport sys\nlines=sys.stdin.read().split()\nnums=list(map(int,lines[:-1]))\ntarget=int(lines[-1])\nprint(*twoSum(nums,target))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);List<Integer> nl=new ArrayList<>();while(sc.hasNextInt()){nl.add(sc.nextInt());}int t=nl.remove(nl.size()-1);int[] nums=nl.stream().mapToInt(Integer::intValue).toArray();Solution s=new Solution();int[] r=s.twoSum(nums,t);System.out.println(r[0]+" "+r[1]);}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){int x;vector<int>v;while(cin>>x)v.push_back(x);int t=v.back();v.pop_back();Solution s;auto r=s.twoSum(v,t);cout<<r[0]<<" "<<r[1]<<endl;}`,
      },
      validateOutput: (out, exp) => { const p=out.trim().split(/\s+/).map(Number).sort((a,b)=>a-b); const e=[...exp].sort((a,b)=>a-b); return JSON.stringify(p)===JSON.stringify(e); },
            aiTime: 14000,
    },
    {
      id: "e2", title: "Valid Parentheses",
      description: `Given string \`s\` containing \`(){}[]\`, return true if input is valid.\n\nBrackets must close in correct order.`,
      examples: [
        { input: 's="()"', output: "true" },
        { input: 's="()[]{}"', output: "true" },
        { input: 's="(]"', output: "false" },
      ],
      testCases: [
        { input: { s: "()" }, expected: true },
        { input: { s: "()[]{}" }, expected: true },
        { input: { s: "(]" }, expected: false },
        { input: { s: "{[]}" }, expected: true },
      ],
      starter: {
        javascript: `function isValid(s) {\n  \n}`,
        python: `def isValid(s):\n    pass`,
        java: `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};`,
      },
      call: (i) => `return isValid(${JSON.stringify(i.s)});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => inp.s,
      wrapCode: {
        javascript: (c) => c + `\nconst s=require('fs').readFileSync('/dev/stdin','utf8').trim();console.log(isValid(s));`,
        python: (c) => c + `\nimport sys\ns=sys.stdin.read().strip()\nprint(str(isValid(s)).lower())`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);String s=sc.nextLine();Solution sol=new Solution();System.out.println(sol.isValid(s));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){string s;getline(cin,s);Solution sol;cout<<(sol.isValid(s)?"true":"false")<<endl;}`,
      },
      validateOutput: (out, exp) => out.trim().toLowerCase() === String(exp).toLowerCase(),
            aiTime: 11000,
    },
    {
      id: "e3", title: "Reverse String",
      description: `Return the reversed version of string \`s\`.\n\nExample: "hello" → "olleh"`,
      examples: [
        { input: 's="hello"', output: '"olleh"' },
        { input: 's="world"', output: '"dlrow"' },
      ],
      testCases: [
        { input: { s: "hello" }, expected: "olleh" },
        { input: { s: "world" }, expected: "dlrow" },
        { input: { s: "a" }, expected: "a" },
        { input: { s: "ab" }, expected: "ba" },
      ],
      starter: {
        javascript: `function reverseString(s) {\n  \n}`,
        python: `def reverseString(s):\n    pass`,
        java: `class Solution {\n    public String reverseString(String s) {\n        return "";\n    }\n}`,
        cpp: `class Solution {\npublic:\n    string reverseString(string s) {\n        return "";\n    }\n};`,
      },
      call: (i) => `return reverseString(${JSON.stringify(i.s)});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => inp.s,
      wrapCode: {
        javascript: (c) => c + `\nconst s=require('fs').readFileSync('/dev/stdin','utf8').trim();console.log(reverseString(s));`,
        python: (c) => c + `\nimport sys\ns=sys.stdin.read().strip()\nprint(reverseString(s))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);String s=sc.nextLine();Solution sol=new Solution();System.out.println(sol.reverseString(s));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){string s;getline(cin,s);Solution sol;cout<<sol.reverseString(s)<<endl;}`,
      },
      validateOutput: (out, exp) => out.trim() === exp,
            aiTime: 9000,
    },
  ],
  medium: [
    {
      id: "m1", title: "Maximum Subarray",
      description: `Find the contiguous subarray with the largest sum and return its sum.\n\n*Hint: Kadane's Algorithm*`,
      examples: [
        { input: "nums=[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1]=6" },
        { input: "nums=[1]", output: "1" },
      ],
      testCases: [
        { input: { nums: [-2,1,-3,4,-1,2,1,-5,4] }, expected: 6 },
        { input: { nums: [1] }, expected: 1 },
        { input: { nums: [5,4,-1,7,8] }, expected: 23 },
        { input: { nums: [-1,-2,-3] }, expected: -1 },
      ],
      starter: {
        javascript: `function maxSubArray(nums) {\n  \n}`,
        python: `def maxSubArray(nums):\n    pass`,
        java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};`,
      },
      call: (i) => `return maxSubArray(${JSON.stringify(i.nums)});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => inp.nums.join(' '),
      wrapCode: {
        javascript: (c) => c + `\nconst nums=require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);console.log(maxSubArray(nums));`,
        python: (c) => c + `\nimport sys\nnums=list(map(int,sys.stdin.read().split()))\nprint(maxSubArray(nums))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);List<Integer> l=new ArrayList<>();while(sc.hasNextInt())l.add(sc.nextInt());int[] nums=l.stream().mapToInt(Integer::intValue).toArray();System.out.println(new Solution().maxSubArray(nums));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){int x;vector<int>v;while(cin>>x)v.push_back(x);cout<<Solution().maxSubArray(v)<<endl;}`,
      },
      validateOutput: (out, exp) => Number(out.trim()) === exp,
            aiTime: 20000,
    },
    {
      id: "m2", title: "Binary Search",
      description: `Search for \`target\` in sorted array. Return index or -1 if not found.\n\nMust be O(log n).`,
      examples: [
        { input: "nums=[-1,0,3,5,9,12], target=9", output: "4" },
        { input: "nums=[-1,0,3,5,9,12], target=2", output: "-1" },
      ],
      testCases: [
        { input: { nums: [-1,0,3,5,9,12], target: 9 }, expected: 4 },
        { input: { nums: [-1,0,3,5,9,12], target: 2 }, expected: -1 },
        { input: { nums: [5], target: 5 }, expected: 0 },
        { input: { nums: [1,3,5,7,9], target: 3 }, expected: 1 },
      ],
      starter: {
        javascript: `function search(nums, target) {\n  \n}`,
        python: `def search(nums, target):\n    pass`,
        java: `class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`,
      },
      call: (i) => `return search(${JSON.stringify(i.nums)},${i.target});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => `${inp.nums.join(' ')}\n${inp.target}`,
      wrapCode: {
        javascript: (c) => c + `\nconst lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');const nums=lines[0].split(' ').map(Number);const target=Number(lines[1]);console.log(search(nums,target));`,
        python: (c) => c + `\nimport sys\nlines=sys.stdin.read().split('\\n')\nnums=list(map(int,lines[0].split()))\ntarget=int(lines[1])\nprint(search(nums,target))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);List<Integer> l=new ArrayList<>();String[] parts=sc.nextLine().split(" ");for(String p:parts)l.add(Integer.parseInt(p));int t=Integer.parseInt(sc.nextLine().trim());int[] nums=l.stream().mapToInt(Integer::intValue).toArray();System.out.println(new Solution().search(nums,t));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){string line;getline(cin,line);istringstream ss(line);int x;vector<int>v;while(ss>>x)v.push_back(x);int t;cin>>t;cout<<Solution().search(v,t)<<endl;}`,
      },
      validateOutput: (out, exp) => Number(out.trim()) === exp,
            aiTime: 17000,
    },
    {
      id: "m3", title: "Longest Substring",
      description: `Given string \`s\`, find length of the longest substring without repeating characters.\n\n*Hint: Sliding Window*`,
      examples: [
        { input: 's="abcabcbb"', output: "3", explanation: '"abc"' },
        { input: 's="bbbbb"', output: "1" },
        { input: 's="pwwkew"', output: "3" },
      ],
      testCases: [
        { input: { s: "abcabcbb" }, expected: 3 },
        { input: { s: "bbbbb" }, expected: 1 },
        { input: { s: "pwwkew" }, expected: 3 },
        { input: { s: "" }, expected: 0 },
      ],
      starter: {
        javascript: `function lengthOfLongestSubstring(s) {\n  \n}`,
        python: `def lengthOfLongestSubstring(s):\n    pass`,
        java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};`,
      },
      call: (i) => `return lengthOfLongestSubstring(${JSON.stringify(i.s)});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => inp.s,
      wrapCode: {
        javascript: (c) => c + `\nconst s=require('fs').readFileSync('/dev/stdin','utf8').trim();console.log(lengthOfLongestSubstring(s));`,
        python: (c) => c + `\nimport sys\ns=sys.stdin.read().strip()\nprint(lengthOfLongestSubstring(s))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);String s=sc.hasNextLine()?sc.nextLine():"";System.out.println(new Solution().lengthOfLongestSubstring(s));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){string s;getline(cin,s);cout<<Solution().lengthOfLongestSubstring(s)<<endl;}`,
      },
      validateOutput: (out, exp) => Number(out.trim()) === exp,
            aiTime: 22000,
    },
  ],
  hard: [
    {
      id: "h1", title: "Trapping Rain Water",
      description: `Given elevation map \`height\`, compute how much water it can trap after raining.\n\n*Hint: Two Pointer*`,
      examples: [
        { input: "height=[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
        { input: "height=[4,2,0,3,2,5]", output: "9" },
      ],
      testCases: [
        { input: { height: [0,1,0,2,1,0,1,3,2,1,2,1] }, expected: 6 },
        { input: { height: [4,2,0,3,2,5] }, expected: 9 },
        { input: { height: [3,0,3] }, expected: 3 },
        { input: { height: [0,0,0] }, expected: 0 },
      ],
      starter: {
        javascript: `function trap(height) {\n  \n}`,
        python: `def trap(height):\n    pass`,
        java: `class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};`,
      },
      call: (i) => `return trap(${JSON.stringify(i.height)});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => inp.height.join(' '),
      wrapCode: {
        javascript: (c) => c + `\nconst height=require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);console.log(trap(height));`,
        python: (c) => c + `\nimport sys\nheight=list(map(int,sys.stdin.read().split()))\nprint(trap(height))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);List<Integer> l=new ArrayList<>();while(sc.hasNextInt())l.add(sc.nextInt());int[] h=l.stream().mapToInt(Integer::intValue).toArray();System.out.println(new Solution().trap(h));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){int x;vector<int>v;while(cin>>x)v.push_back(x);cout<<Solution().trap(v)<<endl;}`,
      },
      validateOutput: (out, exp) => Number(out.trim()) === exp,
            aiTime: 38000,
    },
    {
      id: "h2", title: "Median of Two Arrays",
      description: `Given two sorted arrays \`nums1\` and \`nums2\`, return the median.\n\nMust be O(log(m+n)).`,
      examples: [
        { input: "nums1=[1,3], nums2=[2]", output: "2.0" },
        { input: "nums1=[1,2], nums2=[3,4]", output: "2.5" },
      ],
      testCases: [
        { input: { nums1: [1,3], nums2: [2] }, expected: 2.0 },
        { input: { nums1: [1,2], nums2: [3,4] }, expected: 2.5 },
        { input: { nums1: [], nums2: [1] }, expected: 1.0 },
      ],
      starter: {
        javascript: `function findMedianSortedArrays(nums1, nums2) {\n  \n}`,
        python: `def findMedianSortedArrays(nums1, nums2):\n    pass`,
        java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        return 0.0;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};`,
      },
      call: (i) => `return findMedianSortedArrays(${JSON.stringify(i.nums1)},${JSON.stringify(i.nums2)});`,
      validate: (o, e) => Math.abs(o - e) < 0.001,
      toStdin: (inp) => `${inp.nums1.length} ${inp.nums1.join(' ')}\n${inp.nums2.length} ${inp.nums2.join(' ')}`,
      wrapCode: {
        javascript: (c) => c + `\nconst lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');const p1=lines[0].split(' ').map(Number);const p2=lines[1].split(' ').map(Number);const n1=p1.slice(1);const n2=p2.slice(1);console.log(findMedianSortedArrays(n1,n2));`,
        python: (c) => c + `\nimport sys\nlines=sys.stdin.read().split('\\n')\np1=list(map(int,lines[0].split()));nums1=p1[1:]\np2=list(map(int,lines[1].split()));nums2=p2[1:]\nprint(findMedianSortedArrays(nums1,nums2))`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);int n1=sc.nextInt();int[]arr1=new int[n1];for(int i=0;i<n1;i++)arr1[i]=sc.nextInt();int n2=sc.nextInt();int[]arr2=new int[n2];for(int i=0;i<n2;i++)arr2[i]=sc.nextInt();System.out.println(new Solution().findMedianSortedArrays(arr1,arr2));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){int n1;cin>>n1;vector<int>v1(n1);for(auto&x:v1)cin>>x;int n2;cin>>n2;vector<int>v2(n2);for(auto&x:v2)cin>>x;cout<<fixed<<setprecision(1)<<Solution().findMedianSortedArrays(v1,v2)<<endl;}`,
      },
      validateOutput: (out, exp) => Math.abs(parseFloat(out.trim()) - exp) < 0.01,
            aiTime: 45000,
    },
    {
      id: "h3", title: "Word Break",
      description: `Given string \`s\` and dictionary \`wordDict\`, return true if \`s\` can be segmented into dictionary words.\n\n*Hint: DP*`,
      examples: [
        { input: 's="leetcode", wordDict=["leet","code"]', output: "true" },
        { input: 's="catsandog", wordDict=["cats","dog","sand"]', output: "false" },
      ],
      testCases: [
        { input: { s: "leetcode", wordDict: ["leet","code"] }, expected: true },
        { input: { s: "applepenapple", wordDict: ["apple","pen"] }, expected: true },
        { input: { s: "catsandog", wordDict: ["cats","dog","sand","and","cat"] }, expected: false },
      ],
      starter: {
        javascript: `function wordBreak(s, wordDict) {\n  \n}`,
        python: `def wordBreak(s, wordDict):\n    pass`,
        java: `class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        return false;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {\n        return false;\n    }\n};`,
      },
      call: (i) => `return wordBreak(${JSON.stringify(i.s)},${JSON.stringify(i.wordDict)});`,
      validate: (o, e) => o === e,
      toStdin: (inp) => `${inp.s}\n${inp.wordDict.join(' ')}`,
      wrapCode: {
        javascript: (c) => c + `\nconst lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');const s=lines[0];const wordDict=lines[1].split(' ');console.log(wordBreak(s,wordDict));`,
        python: (c) => c + `\nimport sys\nlines=sys.stdin.read().split('\\n')\ns=lines[0]\nwordDict=lines[1].split()\nprint(str(wordBreak(s,wordDict)).lower())`,
        java: (c) => `import java.util.*;\npublic class Main{\n${c.replace('class Solution','static class Solution')}\npublic static void main(String[] a){Scanner sc=new Scanner(System.in);String s=sc.nextLine();String[]w=sc.nextLine().split(" ");List<String>wd=Arrays.asList(w);System.out.println(new Solution().wordBreak(s,wd));}}`,
        cpp: (c) => `#include<bits/stdc++.h>\nusing namespace std;\n${c}\nint main(){string s,w;getline(cin,s);getline(cin,w);vector<string>wd;istringstream ss(w);string t;while(ss>>t)wd.push_back(t);cout<<(Solution().wordBreak(s,wd)?"true":"false")<<endl;}`,
      },
      validateOutput: (out, exp) => out.trim().toLowerCase() === String(exp).toLowerCase(),
            aiTime: 48000,
    },
  ],
};

/* ─── CODE RUNNER ────────────────────────────────────────────── */
function runCodeJS(code, question) {
  const results = [];
  let allPassed = true;
  for (const tc of question.testCases) {
    try {
      const out = new Function(code + "\n" + question.call(tc.input))();
      const passed = question.validate(out, tc.expected);
      if (!passed) allPassed = false;
      results.push({ passed, input: JSON.stringify(tc.input), expected: JSON.stringify(tc.expected), output: JSON.stringify(out) });
    } catch (e) {
      allPassed = false;
      results.push({ passed: false, input: JSON.stringify(tc.input), expected: JSON.stringify(tc.expected), output: `Error: ${e.message}` });
    }
  }
  return { results, allPassed };
}

async function submitToJudge0(sourceCode, languageId, stdin) {
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const d64 = (s) => { try { return s ? decodeURIComponent(escape(atob(s))) : ""; } catch { return s || ""; } };
  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code: b64(sourceCode), language_id: languageId, stdin: b64(stdin), cpu_time_limit: 5, memory_limit: 128000 }),
  });
  if (!res.ok) throw new Error(`Judge0 error: ${res.status}`);
  const { token } = await res.json();
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 700));
    const poll = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true`);
    const data = await poll.json();
    if (data.status.id <= 2) continue;
    const stdout = d64(data.stdout).trim();
    const compileErr = d64(data.compile_output).trim();
    const stderr = d64(data.stderr).trim();
    if (data.status.id === 3) return { ok: true, stdout };
    return { ok: false, stdout, error: compileErr || stderr || data.status.description };
  }
  return { ok: false, stdout: "", error: "Timed out waiting for Judge0" };
}

async function runCodeJudge0(code, question, language) {
  const lang = LANGUAGES.find(l => l.id === language);
  const results = [];
  let allPassed = true;
  for (const tc of question.testCases) {
    try {
      const stdin = question.toStdin(tc.input);
      const fullCode = question.wrapCode[language](code);
      const { ok, stdout, error } = await submitToJudge0(fullCode, lang.judge0Id, stdin);
      if (!ok) {
        allPassed = false;
        results.push({ passed: false, input: JSON.stringify(tc.input), expected: JSON.stringify(tc.expected), output: error || "Runtime Error" });
        continue;
      }
      const passed = question.validateOutput(stdout, tc.expected);
      if (!passed) allPassed = false;
      results.push({ passed, input: JSON.stringify(tc.input), expected: JSON.stringify(tc.expected), output: stdout });
    } catch (e) {
      allPassed = false;
      results.push({ passed: false, input: JSON.stringify(tc.input), expected: JSON.stringify(tc.expected), output: `Error: ${e.message}` });
    }
  }
  return { results, allPassed };
}

/* ─── UI COMPONENTS (Confetti, Blast, HP Bar, Timer, etc) ─── */
function Confetti() {
  const cols = ["#00f2ff","#ff007a","#f5a623","#9b7fff","#4fa3e0","#facc15","#34d399"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    left: Math.random() * 52, size: 6 + Math.random() * 10, color: cols[i % cols.length],
    delay: Math.random() * 0.7, dur: 1.0 + Math.random() * 1.4, isCircle: Math.random() > 0.5, rotate: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p, i) => (
        <div key={i} style={{ position:"absolute", left:`${p.left}%`, top:"-10%", width:`${p.size}px`, height:`${p.size}px`, background:p.color, borderRadius:p.isCircle?"50%":"2px", transform:`rotate(${p.rotate}deg)`, animation:`cffall ${p.dur}s ease-in ${p.delay}s forwards`, boxShadow: `0 0 8px ${p.color}` }}/>
      ))}
      <style>{`@keyframes cffall{0%{top:-10%;opacity:1;transform:rotate(0deg) scale(1);}100%{top:108%;opacity:0;transform:rotate(720deg) scale(0.5);}}`}</style>
    </div>
  );
}

function BombBlast() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div style={{ position:"absolute", right:"18%", top:"22%", fontSize:"90px", animation:"bomb1 1.6s ease-out forwards" }}>💥</div>
      <div style={{ position:"absolute", right:"26%", top:"40%", fontSize:"48px", animation:"bomb1 1.2s ease-out 0.12s forwards" }}>💥</div>
      <div style={{ position:"absolute", right:"10%", top:"32%", fontSize:"38px", animation:"bomb1 1.0s ease-out 0.22s forwards" }}>💥</div>
      <style>{`@keyframes bomb1{0%{transform:scale(0);opacity:0;}18%{transform:scale(2.6);opacity:1;}55%{transform:scale(2.0);opacity:0.85;}100%{transform:scale(3.2);opacity:0;}}`}</style>
    </div>
  );
}

function SkipNotif({ opponentName }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div style={{ animation:"skipani 1.4s ease-out forwards" }} className="bg-[#0a101f]/90 backdrop-blur-md border-2 border-[#ff007a] rounded-2xl px-8 py-5 text-center shadow-[0_0_30px_rgba(255,0,122,0.4)]">
        <div className="text-4xl mb-2">🤖💨</div>
        <div className="text-[#ff007a] font-black text-lg">{opponentName || "AlgoBot"} Solved It First!</div>
        <div className="text-[#00f2ff] text-sm mt-1">Moving to next module…</div>
      </div>
      <style>{`@keyframes skipani{0%{opacity:0;transform:scale(0.8) translateY(10px);}12%{opacity:1;transform:scale(1.04) translateY(0);}70%{opacity:1;transform:scale(1);}100%{opacity:0;transform:scale(0.96) translateY(-6px);}}`}</style>
    </div>
  );
}

function HPBar({ hp, label, isYou }) {
  const pct = Math.max(0, Math.min(100, hp));
  const col = pct > 60 ? "#00f2ff" : pct > 30 ? "#f5a623" : "#ff007a";
  return (
    <div className={`flex flex-col ${isYou ? "items-start" : "items-end"}`}>
      <span className="text-xs text-gray-400 mb-1 max-w-36 truncate font-mono uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        {!isYou && <span className="text-sm font-bold font-mono" style={{color:col}}>{hp}HP</span>}
        <div className="w-28 h-2 bg-gray-900 rounded-full overflow-hidden border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:col, boxShadow: `0 0 10px ${col}`}}/>
        </div>
        {isYou && <span className="text-sm font-bold font-mono" style={{color:col}}>{hp}HP</span>}
      </div>
    </div>
  );
}

function LiveTimer({ seconds }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = (seconds / ROUND_TIME) * 100;
  const urgent = seconds <= 30;
  const crit = seconds <= 10;
  return (
    <div className={`flex flex-col items-center ${crit ? "animate-pulse" : ""}`}>
      <div className={`font-mono font-black text-xl tabular-nums leading-none ${crit?"text-[#ff007a]":urgent?"text-[#f5a623]":"text-[#00f2ff]"}`}>
        {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
      </div>
      <div className="w-16 h-1 bg-gray-900 rounded-full overflow-hidden mt-1 border border-white/5">
        <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_5px_currentColor]" style={{ width:`${pct}%`, background: crit?"#ff007a":urgent?"#f5a623":"#00f2ff" }}/>
      </div>
    </div>
  );
}

const STATUS = {
  idle:       { icon:"💤", label:"Idle",        cls:"text-gray-500  bg-[#0f172a]/80    border-gray-700/40" },
  thinking:   { icon:"🤔", label:"Thinking…",    cls:"text-[#00f2ff]  bg-cyan-900/30    border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.2)]" },
  typing:     { icon:"⌨️",  label:"Typing…",      cls:"text-[#f5a623] bg-orange-900/30 border-orange-700/40 shadow-[0_0_10px_rgba(245,166,35,0.2)]" },
  submitting: { icon:"⚡", label:"Submitting!",  cls:"text-purple-400 bg-purple-900/30 border-purple-700/40" },
  solved:     { icon:"✅", label:"Solved!",       cls:"text-green-400  bg-green-900/30  border-green-700/40 shadow-[0_0_10px_rgba(74,222,128,0.2)]" },
  failed:     { icon:"❌", label:"Wrong ans",    cls:"text-[#ff007a]    bg-pink-900/30    border-[#ff007a]/40 shadow-[0_0_10px_rgba(255,0,122,0.2)]" },
};
function OpponentStatus({ status }) {
  const s = STATUS[status] || STATUS.idle;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider transition-all duration-400 ${s.cls}`}>
      <span>{s.icon}</span><span>{s.label}</span>
    </div>
  );
}

function QuestionPanel({ question, difficulty, qIdx, totalQs, mySolved, aiSolved }) {
  const cfg = {
    easy:   { col:"#00f2ff", bg:"bg-cyan-900/20",  bdr:"border-[#00f2ff]/30",  label:"Level 1"   },
    medium: { col:"#f5a623", bg:"bg-orange-900/20",  bdr:"border-orange-500/30",  label:"Level 2" },
    hard:   { col:"#ff007a", bg:"bg-pink-900/20",    bdr:"border-[#ff007a]/30",    label:"Level 3"   },
  }[difficulty];
  return (
    <div className="h-full overflow-y-auto p-4 text-sm font-sans">
      <div className="flex items-center gap-2 mb-3">
        {Array.from({length:totalQs},(_,i)=>(
          <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${ mySolved[i]?"bg-cyan-500/20 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.5)]" :aiSolved[i]?"bg-pink-900/40 border-[#ff007a] text-[#ff007a] shadow-[0_0_8px_rgba(255,0,122,0.5)]" :i===qIdx?"bg-purple-700/50 border-purple-400 text-white" :"bg-[#0f172a] border-gray-700 text-gray-500" }`}>
            {mySolved[i]?"✓":aiSolved[i]?"✗":i+1}
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-1 font-mono">MOD {qIdx+1}/{totalQs}</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${cfg.bg} ${cfg.bdr}`} style={{color:cfg.col}}>{cfg.label}</span>
        <h2 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{question.title} <span className="text-[#00f2ff]">_</span></h2>
      </div>
      <p className="text-gray-300 text-xs leading-relaxed mb-5 whitespace-pre-wrap font-medium">{question.description}</p>
      <div className="space-y-3 mb-5">
        {question.examples.map((ex,i)=>(
          <div key={i} className="bg-[#0a101f]/80 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg">
            <div className="text-[9px] text-[#00f2ff] mb-1 uppercase tracking-widest font-bold opacity-80">Example_{i+1}</div>
            <div className="font-mono text-xs text-gray-300 space-y-0.5">
              <div><span className="text-gray-500">&gt; input: </span><span className="text-white">{ex.input}</span></div>
              <div><span className="text-[#ff007a] opacity-80">&gt; output: </span><span className="font-bold text-white">{ex.output}</span></div>
              {ex.explanation&&<div className="text-gray-500 mt-1 italic">// {ex.explanation}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#0a101f]/80 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg">
        <div className="text-[9px] text-gray-500 mb-2 uppercase tracking-widest font-bold">Validation Parameters ({question.testCases.length})</div>
        {question.testCases.map((tc,i)=>(
          <div key={i} className="font-mono text-[11px] text-gray-400 py-1 border-b border-white/5 last:border-0">
            <span className="text-cyan-600/50">#{i+1} </span>{JSON.stringify(tc.input).slice(0,40)} <span className="text-gray-600">→</span> <span className="text-cyan-400">{JSON.stringify(tc.expected)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundOverModal({ roundIdx, myScore, aiScore, opponentName, onNext, isLastRound, totalMyWins, totalAiWins }) {
  const diff = ROUNDS[roundIdx];
  const iWon = myScore > aiScore;
  const tied = myScore === aiScore;
  return (
    <div className="fixed inset-0 bg-[#050b14]/90 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-[#0a101f] border border-white/10 rounded-2xl p-8 w-80 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#00f2ff]/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#ff007a]/20 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="text-5xl mb-3 relative z-10">{tied?"🤝":iWon?"🏆":"😤"}</div>
        <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight relative z-10">Module {tied?"Tied":iWon?"Cleared":"Failed"}</h3>
        <p className="text-gray-400 text-xs mb-5 uppercase tracking-widest relative z-10">{tied?"No decisive outcome":iWon?"Dominance established":`Compromised by ${opponentName || "AlgoBot"}`}</p>
        
        <div className="bg-[#050b14]/80 rounded-xl p-4 mb-3 border border-white/5 relative z-10">
          <div className="text-[9px] text-[#00f2ff] uppercase mb-2 font-bold tracking-widest">Current Output</div>
          <div className="flex justify-around">
            <div className="text-center"><div className="text-3xl font-black text-white">{myScore}</div><div className="text-[10px] text-gray-500 uppercase tracking-widest">Self</div></div>
            <div className="text-gray-700 text-xl self-center">—</div>
            <div className="text-center"><div className="text-3xl font-black text-white">{aiScore}</div><div className="text-[10px] text-gray-500 uppercase tracking-widest">{opponentName || "AlgoBot"}</div></div>
          </div>
        </div>
        
        <div className="bg-[#050b14]/80 rounded-xl p-3 mb-5 border border-white/5 relative z-10">
          <div className="text-[9px] text-gray-500 uppercase mb-2 font-bold tracking-widest">Global Standings</div>
          <div className="flex justify-around">
            <div className="text-center"><div className="text-xl font-black text-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.3)]">{totalMyWins}</div><div className="text-[9px] text-gray-600 uppercase">Self</div></div>
            <div className="text-gray-700 text-lg self-center">—</div>
            <div className="text-center"><div className="text-xl font-black text-[#ff007a] shadow-[0_0_10px_rgba(255,0,122,0.3)]">{totalAiWins}</div><div className="text-[9px] text-gray-600 uppercase">{opponentName || "AlgoBot"}</div></div>
          </div>
        </div>
        
        <button onClick={onNext} className="w-full py-3 bg-gradient-to-r from-[#00f2ff] to-blue-600 hover:brightness-125 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] relative z-10">
          {isLastRound?"Access Final Data >>":`Initialize Level ${ROUNDS.indexOf(diff)+2} >>`}
        </button>
      </div>
    </div>
  );
}

// ---> MATCHMAKING: 10 SECONDS AI FALLBACK ADDED HERE <---
function Matchmaking({ username, onReady, setOpponentName, setRoom, setIsAiMode }) {
  const [sec, setSec] = useState(0);
  const [found, setFound] = useState(false);
  const [oppName, setOppName] = useState("");
  const [isAiFallback, setIsAiFallback] = useState(false);

  useEffect(()=>{
    let foundMatch = false;

    const iv = setInterval(()=>{
      setSec(s => {
        if (s >= 9 && !foundMatch) {
          foundMatch = true;
          clearInterval(iv);
          setFound(true);
          setIsAiFallback(true);
          setOppName("AlgoBot");
          setOpponentName("AlgoBot");
          setIsAiMode(true);
          setTimeout(()=>onReady(), 2000);
          return s + 1;
        }
        return s + 1;
      });
    }, 1000);
    
    socket.emit('search_match', { username });

    socket.on('match_found', (data) => {
      if (foundMatch) return; 
      foundMatch = true;
      clearInterval(iv);
      const isMeP1 = data.opponentForP1.username === username;
      const opponent = isMeP1 ? data.opponentForP2 : data.opponentForP1;
      
      setFound(true);
      setIsAiFallback(false);
      setOppName(opponent.username);
      setOpponentName(opponent.username);
      setRoom(data.room);
      setIsAiMode(false);
      
      setTimeout(()=>onReady(), 2000);
    });

    return ()=>{
      clearInterval(iv);
      socket.off('match_found');
    };
  },[username, onReady, setOpponentName, setRoom, setIsAiMode]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4 relative z-10">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">DEV<span className="text-[#00f2ff]">_</span>QUEST</h2>
        <p className="text-[#00f2ff] text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Neural Combat Sync</p>
      </div>
      
      <div className="bg-[#0a101f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-80 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex justify-center items-center gap-6 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[#00f2ff]/10 border-2 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.4)] flex items-center justify-center text-3xl">👤</div>
            <span className="text-[10px] uppercase tracking-widest text-[#00f2ff] font-bold">{username}</span>
          </div>
          
          <div className="flex flex-col gap-1 items-center justify-center">
             <span className="text-gray-600 text-sm font-black italic">VS</span>
             <div className="w-px h-8 bg-white/10" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 transition-all duration-700 ${found?"bg-[#ff007a]/10 border-[#ff007a] shadow-[0_0_15px_rgba(255,0,122,0.4)]":"bg-[#050b14] border-white/10 animate-pulse"}`}>
              {found? (isAiFallback ? "🤖" : "🔥") : "?"}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${found ? "text-[#ff007a]" : "text-gray-500"}`}>{found?oppName:"Scanning"}</span>
          </div>
        </div>
        
        {!found?(
          <div className="mt-4">
            <div className="h-1 bg-[#050b14] rounded-full overflow-hidden mb-3 border border-white/5">
              <div className="h-full bg-gradient-to-r from-[#00f2ff] to-[#ff007a] rounded-full transition-all duration-1000 shadow-[0_0_8px_#00f2ff]" style={{width:`${(sec/10)*100}%`}}/>
            </div>
            <p className="text-[#00f2ff] text-[9px] uppercase tracking-widest font-bold animate-pulse">Awaiting Opponent Connection // {sec}s</p>
          </div>
        ):(
          <div className="mt-4">
             {isAiFallback ? (
              <p className="text-[#f5a623] font-bold text-[10px] uppercase tracking-widest animate-pulse">Network Timeout. AlgoBot Engaging.</p>
            ) : (
              <p className="text-green-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Connection Established. Linking...</p>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-[#0a101f]/50 border border-white/5 rounded-xl p-5 w-80 text-[10px] text-gray-400 space-y-2 uppercase tracking-wider font-mono">
        <div className="text-[#00f2ff] font-bold mb-3 text-xs italic tracking-tighter">Mission Parameters</div>
        <div className="flex gap-2 items-start"><span>&gt;</span> 3 Modules per sequence</div>
        <div className="flex gap-2 items-start"><span>&gt;</span> Enemy bypass auto-skips module</div>
        <div className="flex gap-2 items-start"><span>&gt;</span> Victory yields visual confirmation</div>
        <div className="flex gap-2 items-start"><span>&gt;</span> Maximize module completion</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AlgoArena() {
  
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

  const [screen, setScreen]     = useState("lobby");
  const [username, setUsername] = useState(userData?.name || ""); 
  const [aiDiff, setAiDiff]     = useState("medium");

  const [opponentName, setOpponentName] = useState("Opponent");
  const [room, setRoom] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);

  const [roundIdx, setRoundIdx] = useState(0);
  const [qIdx, setQIdx]         = useState(0);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const [myRoundScore, setMyRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);
  const [myTotalWins, setMyTotalWins]   = useState(0);
  const [aiTotalWins, setAiTotalWins]   = useState(0);

  const [mySolvedMap, setMySolvedMap] = useState({});
  const [aiSolvedMap, setAiSolvedMap] = useState({});

  const [myHP, setMyHP] = useState(100);
  const [aiHP, setAiHP] = useState(100);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showBomb, setShowBomb]         = useState(false);
  const [showSkip, setShowSkip]         = useState(false);

  const [opponentStatus, setOpponentStatus] = useState("idle");
  const [timeLeft, setTimeLeft]             = useState(ROUND_TIME);

  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver]   = useState(null);
  const [toasts, setToasts]       = useState([]);

  const aiTimers      = useRef([]);
  const statusTimers  = useRef([]);
  const roundFired    = useRef(false);
  const timerRef      = useRef(null);

  const qIdxRef         = useRef(qIdx);
  const myRoundRef      = useRef(myRoundScore);
  const aiRoundRef      = useRef(aiRoundScore);
  const roundIdxRef     = useRef(roundIdx);

  useEffect(()=>{ qIdxRef.current = qIdx; },         [qIdx]);
  useEffect(()=>{ myRoundRef.current = myRoundScore; },[myRoundScore]);
  useEffect(()=>{ aiRoundRef.current = aiRoundScore; },[aiRoundScore]);
  useEffect(()=>{ roundIdxRef.current = roundIdx; },  [roundIdx]);

  const difficulty = ROUNDS[roundIdx];
  const questions  = QUESTIONS[difficulty];
  const currentQ   = questions[qIdx];
  const totalQs    = 3;

  const mySolvedArr = [0,1,2].map(i=>!!mySolvedMap[`${roundIdx}-${i}`]);
  const aiSolvedArr = [0,1,2].map(i=>!!aiSolvedMap[`${roundIdx}-${i}`]);

  useEffect(()=>{
    if (currentQ?.starter?.[language]) setCode(currentQ.starter[language]);
    setTestResults(null);
  },[qIdx,roundIdx,language]);

  useEffect(()=>{
    if (screen!=="battle"||roundOver||gameOver) return;
    setTimeLeft(ROUND_TIME);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if (t<=1){
          clearInterval(timerRef.current);
          doEndRound(myRoundRef.current, aiRoundRef.current);
          return 0;
        }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[roundIdx,screen]);

  const addToast = (msg, type="info")=>{
    const id = Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  };

  const flashConfetti = ()=>{ setShowConfetti(true); setTimeout(()=>setShowConfetti(false),2600); };
  const flashBomb     = ()=>{ setShowBomb(true);     setTimeout(()=>setShowBomb(false),1800);     };

  const doEndRound = useCallback((myRS, aiRS)=>{
    if (roundFired.current) return;
    roundFired.current = true;
    clearInterval(timerRef.current);
    aiTimers.current.forEach(clearTimeout);
    statusTimers.current.forEach(clearTimeout);
    if (myRS > aiRS)      setMyTotalWins(w=>w+1);
    else if (aiRS > myRS) setAiTotalWins(w=>w+1);
    setRoundOver(true);
  },[]);

  const scheduleAIStatus = useCallback((thinkAt, typeAt, submitAt)=>{
    const t1 = setTimeout(()=>setOpponentStatus("thinking"),   thinkAt);
    const t2 = setTimeout(()=>setOpponentStatus("typing"),     typeAt);
    const t3 = setTimeout(()=>setOpponentStatus("submitting"), submitAt);
    statusTimers.current.push(t1,t2,t3);
  }, []);

  // ---> SOCKET OPPONENT SYNC (Only if !isAiMode) <---
  useEffect(()=>{
    if (screen!=="battle" || isAiMode || !room) return;
    
    roundFired.current=false;
    setOpponentStatus("thinking");

    const handleOpponentSolved = ({ qIdx: solvedQIdx }) => {
      setOpponentStatus("solved");
      
      const key = `${roundIdxRef.current}-${solvedQIdx}`;
      setAiSolvedMap(prev=>{
        if (prev[key]) return prev;
        const next = {...prev,[key]:true};
        
        setAiRoundScore(ars=>{
          const newARS = ars+1;
          aiRoundRef.current = newARS;
          setMyHP(h=>Math.max(0,h-12));
          addToast(`🔥 ${opponentName} solved Q${solvedQIdx+1}!`, "danger");
          flashBomb();

          const curQ = qIdxRef.current;
          if (curQ === solvedQIdx){
            setShowSkip(true);
            setTimeout(()=>{
              setShowSkip(false);
              if (solvedQIdx < totalQs-1){
                setQIdx(solvedQIdx+1);
                setTestResults(null);
              }
            }, 1400);
          }
          if (solvedQIdx === totalQs-1){
            const myS = myRoundRef.current;
            setTimeout(()=>doEndRound(myS, newARS), 1600);
          }
          return newARS;
        });
        return next;
      });
      setTimeout(()=>setOpponentStatus("thinking"),2200);
    };

    socket.on('opponent_solved', handleOpponentSolved);
    return ()=>{ socket.off('opponent_solved', handleOpponentSolved); };
  },[screen, room, opponentName, doEndRound, totalQs, isAiMode]);

  // ---> ALGOBOT SYNC (Only if isAiMode) <---
  useEffect(()=>{
    if (screen!=="battle" || !isAiMode) return;

    aiTimers.current.forEach(clearTimeout);
    statusTimers.current.forEach(clearTimeout);
    aiTimers.current=[];
    statusTimers.current=[];
    roundFired.current=false;
    setOpponentStatus("idle");

    const qs   = QUESTIONS[ROUNDS[roundIdx]];
    const mult = aiDiff==="easy"?2.0:aiDiff==="medium"?1.1:0.65;
    let cumulativeDelay = 0;

    qs.forEach((q, qi)=>{
      const solveDelay  = q.aiTime * mult * (0.75+Math.random()*0.5);
      const totalDelay  = cumulativeDelay + solveDelay;
      const willSolve   = Math.random() > (aiDiff==="easy"?0.45:aiDiff==="medium"?0.25:0.08);

      const thinkAt  = cumulativeDelay + solveDelay*0.10;
      const typeAt   = cumulativeDelay + solveDelay*0.42;
      const submitAt = cumulativeDelay + solveDelay*0.86;

      scheduleAIStatus(thinkAt, typeAt, submitAt);

      if (willSolve){
        const t = setTimeout(()=>{
          setOpponentStatus("solved");
          const key = `${roundIdxRef.current}-${qi}`;
          setAiSolvedMap(prev=>{
            if (prev[key]) return prev;
            const next = {...prev,[key]:true};
            setAiRoundScore(ars=>{
              const newARS = ars+1;
              aiRoundRef.current = newARS;
              setMyHP(h=>Math.max(0,h-12));
              addToast(`🤖 AlgoBot solved Q${qi+1}!`,"danger");
              flashBomb();

              const curQ = qIdxRef.current;
              if (curQ === qi){
                setShowSkip(true);
                setTimeout(()=>{
                  setShowSkip(false);
                  if (qi < totalQs-1){
                    setQIdx(qi+1);
                    setTestResults(null);
                  }
                }, 1400);
              }
              if (qi === totalQs-1){
                const myS = myRoundRef.current;
                setTimeout(()=>doEndRound(myS, newARS), 1600);
              }
              return newARS;
            });
            return next;
          });
          setTimeout(()=>setOpponentStatus("thinking"),2200);
        }, totalDelay);
        aiTimers.current.push(t);
      } else {
        const t = setTimeout(()=>{
          setOpponentStatus("failed");
          setTimeout(()=>setOpponentStatus(qi<totalQs-1?"thinking":"idle"),2500);
        }, totalDelay);
        aiTimers.current.push(t);
      }
      cumulativeDelay += solveDelay + (willSolve?2000:2500);
    });

    return ()=>{
      aiTimers.current.forEach(clearTimeout);
      statusTimers.current.forEach(clearTimeout);
    };
  },[roundIdx, screen, isAiMode, aiDiff, doEndRound, scheduleAIStatus]);


  const handleSubmit = useCallback(async ()=>{
    if (submitting) return;
    const key = `${roundIdx}-${qIdx}`;
    if (mySolvedMap[key]) return;
    setSubmitting(true);
    setTestResults(null);

    try {
      let results, allPassed;
      if (language === "javascript") {
        ({ results, allPassed } = runCodeJS(code, currentQ));
      } else {
        ({ results, allPassed } = await runCodeJudge0(code, currentQ, language));
      }
      setTestResults({results, allPassed});
      setSubmitting(false);

      if (allPassed){
        
        // Notify opponent only if it's a real player
        if (!isAiMode) {
          socket.emit('question_solved', { room, qIdx });
        }

        // ---> FIX: EVERY QUESTION COIN UPDATE <---
        // Fetching directly from localStorage inside the function ensures we ALWAYS have the latest coin balance
        const currentUserStr = localStorage.getItem('user');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          if (currentUser && currentUser.id) {
            const newCoins = (currentUser.coins || 0) + 100;
            const updatedUser = { ...currentUser, coins: newCoins };

            axios.post('http://localhost:5000/api/auth/update-stats', {
              userId: currentUser.id,
              coins: newCoins,
              activeAvatarId: currentUser.activeAvatarId,
              unlockedAvatars: currentUser.unlockedAvatars
            }).then(() => {
              setUserData(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              addToast(`🪙 +100 Coins Earned!`, "success"); 
            }).catch(err => console.error("Coin update failed", err));
          }
        }
        // ------------------------------------------------------------

        setMySolvedMap(prev=>{
          if (prev[key]) return prev;
          const next={...prev,[key]:true};
          setMyRoundScore(mrs=>{
            const newMRS=mrs+1;
            myRoundRef.current=newMRS;
            setAiHP(h=>Math.max(0,h-12));
            addToast(`✅ You solved Q${qIdx+1}! 🎉`,"success");
            flashConfetti();
            flashBomb();
            const curQIdx = qIdxRef.current;
            if (curQIdx < totalQs-1){
              setTimeout(()=>{ setQIdx(curQIdx+1); setTestResults(null); },1200);
            } else {
              const aiS = aiRoundRef.current;
              setTimeout(()=>doEndRound(newMRS, aiS), 1000);
            }
            return newMRS;
          });
          return next;
        });
      }
    } catch(e) {
      setTestResults({ results: [{ passed: false, input: "—", expected: "—", output: `Network error: ${e.message}` }], allPassed: false });
      setSubmitting(false);
    }
  },[submitting,roundIdx,qIdx,mySolvedMap,code,currentQ,language,doEndRound, room, isAiMode]);

  useEffect(()=>{
    const h=(e)=>{ if((e.ctrlKey||e.metaKey)&&e.key==="Enter") handleSubmit(); };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[handleSubmit]);

  const handleNextRound = ()=>{
    setRoundOver(false);
    const next=roundIdx+1;
    if (next>=ROUNDS.length){
      setMyTotalWins(mtw=>{ setAiTotalWins(atw=>{ setGameOver({win:mtw>atw,tie:mtw===atw,myWins:mtw,aiWins:atw}); return atw; }); return mtw; });
    } else {
      setRoundIdx(next);
      setQIdx(0);
      setMyRoundScore(0); myRoundRef.current=0;
      setAiRoundScore(0); aiRoundRef.current=0;
      setTestResults(null);
      setOpponentStatus("idle");
      roundFired.current=false;
    }
  };

  const iMeSolved = (ri,qi)=>!!mySolvedMap[`${ri}-${qi}`];
  const isAiSolved= (ri,qi)=>!!aiSolvedMap[`${ri}-${qi}`];

  if (screen==="lobby") return (
    <div className="h-screen bg-[#050b14] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center relative z-10">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00f2ff]/20 blur-[80px] pointer-events-none" />
        <h1 className="text-4xl font-black text-white italic tracking-tighter mb-1 relative">
          DEV<span className="text-[#00f2ff]">_</span>QUEST
        </h1>
        <p className="text-[#00f2ff] text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Neural Combat Sequence</p>
        
        <div className="bg-[#0a101f]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-left space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">Operator Alias</label>
            <input type="text" placeholder="ENTER_IDENTIFIER"
              value={username} onChange={e=>setUsername(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&username&&setScreen("searching")}
              className="w-full bg-[#050b14] border border-white/10 rounded-xl px-4 py-3 text-[#00f2ff] text-sm font-mono focus:outline-none focus:border-[#00f2ff] focus:shadow-[0_0_10px_rgba(0,242,255,0.2)] transition-all"/>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-2">AlgoBot Difficulty</label>
            <div className="flex gap-2">
              {["easy","medium","hard"].map(d=>(
                <button key={d} onClick={()=>setAiDiff(d)}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all border ${
                    aiDiff===d
                      ?d==="easy"?"bg-[#00f2ff]/20 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.3)]"
                        :d==="medium"?"bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(245,166,35,0.3)]"
                        :"bg-[#ff007a]/20 border-[#ff007a] text-[#ff007a] shadow-[0_0_10px_rgba(255,0,122,0.3)]"
                      :"bg-[#050b14] border-white/10 text-gray-500 hover:text-gray-300"
                  }`}>{d}</button>
              ))}
            </div>
          </div>
          <button onClick={()=>username&&setScreen("searching")} disabled={!username}
            className="w-full py-4 bg-gradient-to-r from-[#00f2ff] to-[#3b82f6] disabled:opacity-40 disabled:cursor-not-allowed text-[#050b14] rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:brightness-125 shadow-[0_0_20px_rgba(0,242,255,0.3)]">
            Initialize Scan &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );

  if (screen==="searching") return (
    <div className="h-screen bg-[#050b14] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] font-sans">
      <Matchmaking username={username} onReady={()=>setScreen("battle")} setOpponentName={setOpponentName} setRoom={setRoom} setIsAiMode={setIsAiMode}/>
    </div>
  );

  if (gameOver) return (
    <div className="relative h-screen bg-[#050b14] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] flex items-center justify-center p-6 font-sans">
      {gameOver.win&&<Confetti/>}
      <div className="text-center z-10 max-w-sm w-full bg-[#0a101f]/90 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        {gameOver.win && <div className="absolute inset-0 border-2 border-[#00f2ff] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.3)] pointer-events-none" />}
        <div className="text-6xl mb-4">{gameOver.tie?"🤝":gameOver.win?"🏆":"💀"}</div>
        <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tight italic">
          {gameOver.tie?"Standstill":gameOver.win?"System Master":`Terminated by ${opponentName}`}
        </h2>
        <p className="text-[#00f2ff] text-[10px] uppercase tracking-widest font-bold mb-8">
          {gameOver.tie?"Equilibrium reached":gameOver.win?"Flawless execution across modules":"Re-evaluate logic sequences"}
        </p>
        <div className="bg-[#050b14] border border-white/5 rounded-xl p-5 mb-8">
          <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-4">Final Diagnostics</div>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-4xl font-black text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.2)]">{gameOver.myWins}</div>
              <div className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-widest">{username}</div>
            </div>
            <div className="text-gray-700 text-sm font-black italic self-center">VS</div>
            <div className="text-center">
              <div className="text-4xl font-black text-[#ff007a] shadow-[0_0_15px_rgba(255,0,122,0.2)]">{gameOver.aiWins}</div>
              <div className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-widest">{opponentName}</div>
            </div>
          </div>
        </div>
        <button onClick={()=>window.location.reload()} className="w-full py-4 bg-[#0a101f] border border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff] hover:text-[#050b14] rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]">
          Reboot System &gt;&gt;
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#050b14] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px] overflow-hidden font-sans text-white">

      {showConfetti&&<Confetti/>}
      {showBomb&&<BombBlast/>}
      {showSkip&&<SkipNotif opponentName={opponentName} />}

      {roundOver&&(
        <RoundOverModal
          roundIdx={roundIdx} myScore={myRoundScore} aiScore={aiRoundScore} opponentName={opponentName}
          onNext={handleNextRound} isLastRound={roundIdx===ROUNDS.length-1}
          totalMyWins={myTotalWins} totalAiWins={aiTotalWins}
        />
      )}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center">
        {toasts.map(t=>(
          <div key={t.id} className={`rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider border backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] whitespace-nowrap ${
            t.type==="success"?"bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff]"
            :t.type==="danger"?"bg-[#ff007a]/10 border-[#ff007a] text-[#ff007a]"
            :"bg-[#0a101f]/90 border-white/20 text-white"
          }`} style={{animation:"toastin 0.3s ease-out"}}>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastin{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      <div className="bg-[#0a101f]/80 backdrop-blur-sm border-b border-white/10 px-6 py-3 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-10 relative">
        <HPBar hp={myHP} label={`${username}`} isYou={true}/>
        <div className="flex flex-col items-center shrink-0 gap-1.5">
          <div className="flex gap-2 justify-center">
            {ROUNDS.map((r,i)=>(
              <div key={r} className="text-[8px] px-2 py-0.5 rounded border uppercase font-black tracking-widest"
                style={{
                  background: i===roundIdx?{easy:"rgba(0,242,255,0.15)",medium:"rgba(245,166,35,0.15)",hard:"rgba(255,0,122,0.15)"}[r]:i<roundIdx?"#050b14":"#0a101f",
                  borderColor:i===roundIdx?{easy:"#00f2ff",medium:"#f5a623",hard:"#ff007a"}[r]:"rgba(255,255,255,0.05)",
                  color:i===roundIdx?{easy:"#00f2ff",medium:"#f5a623",hard:"#ff007a"}[r]:i<roundIdx?"#4b5563":"#374151",
                  boxShadow: i===roundIdx ? `0 0 8px ${ {easy:"#00f2ff",medium:"#f5a623",hard:"#ff007a"}[r] }` : 'none'
                }}>
                {i<roundIdx?"✓":r}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-2xl font-black text-white italic">{myRoundScore}</span>
              <div className="text-[8px] text-[#00f2ff] font-bold uppercase tracking-widest mt-0.5">Self</div>
            </div>
            <LiveTimer seconds={timeLeft}/>
            <div className="text-center">
              <span className="text-2xl font-black text-white italic">{aiRoundScore}</span>
              <div className="text-[8px] text-[#ff007a] font-bold uppercase tracking-widest mt-0.5">Hostile</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <HPBar hp={aiHP} label={`${opponentName}`} isYou={false}/>
          <OpponentStatus status={opponentStatus}/>
        </div>
      </div>

      <div className="flex items-center bg-[#050b14]/90 backdrop-blur-md border-b border-white/5 px-4 gap-1 z-10 relative">
        {questions.map((q,i)=>{
          const me=iMeSolved(roundIdx,i);
          const ai=isAiSolved(roundIdx,i);
          const cur=qIdx===i;
          return (
            <div key={i} className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 flex items-center gap-2 whitespace-nowrap select-none transition-colors ${
              cur?"border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/5"
              :me?"border-[#00f2ff]/30 text-[#00f2ff]/50"
              :ai?"border-[#ff007a]/30 text-[#ff007a]/50"
              :"border-transparent text-gray-600 hover:bg-white/5"
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ${
                me?"bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]"
                :ai?"bg-[#ff007a]/20 text-[#ff007a] border border-[#ff007a]"
                :cur?"bg-[#00f2ff] text-[#050b14]"
                :"bg-[#0a101f] text-gray-600 border border-white/10"
              }`}>
                {me?"✓":ai?"✗":i+1}
              </span>
              <span className="hidden sm:inline truncate max-w-28">
                {q.title.length>16?q.title.slice(0,16)+"…":q.title}
              </span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-4 pr-2 shrink-0">
          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest hidden sm:block">
            Wins <span className="text-[#00f2ff] ml-1">{myTotalWins}</span>
            <span className="text-white/20 mx-1.5">//</span>
            <span className="text-[#ff007a]">{aiTotalWins}</span>
          </div>
          <select value={language} onChange={e=>setLanguage(e.target.value)}
            className="bg-[#0a101f] border border-white/10 text-[#00f2ff] text-[10px] font-black uppercase tracking-widest rounded px-2 py-1.5 focus:outline-none focus:border-[#00f2ff]">
            {LANGUAGES.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 min-h-0 relative z-0">
        <div className="col-span-2 border-r border-white/5 bg-[#050b14]/80 backdrop-blur-sm min-h-0 overflow-hidden">
          <QuestionPanel
            question={currentQ} difficulty={difficulty}
            qIdx={qIdx} totalQs={totalQs}
            mySolved={mySolvedArr} aiSolved={aiSolvedArr}
          />
        </div>

        <div className="col-span-3 flex flex-col min-h-0 bg-[#050b14]">
          {iMeSolved(roundIdx,qIdx)&&(
            <div className="bg-[#00f2ff]/10 border-b border-[#00f2ff]/30 px-5 py-2 text-[10px] text-[#00f2ff] font-black uppercase tracking-widest shrink-0 flex items-center gap-2">
              <span className="animate-pulse">_</span> Verification Successful // Module Locked
            </div>
          )}
          {!iMeSolved(roundIdx,qIdx)&&isAiSolved(roundIdx,qIdx)&&(
            <div className="bg-[#ff007a]/10 border-b border-[#ff007a]/30 px-5 py-2 text-[10px] text-[#ff007a] font-black uppercase tracking-widest shrink-0 flex items-center gap-2">
              <span className="animate-pulse">⚠</span> Warning: {opponentName} breached this module. Simulation remains active for practice.
            </div>
          )}

          <div className="flex-1 min-h-0 pt-2">
            <Editor
              height="100%"
              language={LANGUAGES.find(l=>l.id===language)?.monaco||"javascript"}
              value={code} onChange={v=>setCode(v||"")}
              theme="vs-dark"
              options={{
                fontSize:13, minimap:{enabled:false},
                scrollBeyondLastLine:false, lineNumbers:"on",
                wordWrap:"on", tabSize:2, automaticLayout:true,
                padding:{top:16}, fontFamily:"'JetBrains Mono','Fira Code',monospace", fontLigatures:true,
              }}
            />
          </div>

          {testResults&&(
            <div className="border-t border-white/5 bg-[#0a101f] px-5 py-4 max-h-40 overflow-y-auto shrink-0 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
              <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${testResults.allPassed?"text-[#00f2ff]":"text-[#ff007a]"}`}>
                {testResults.allPassed?"System Integrity Verified":"Anomalies Detected in Output"}
              </div>
              <div className="space-y-1.5">
                {testResults.results.map((r,i)=>(
                  <div key={i} className={`text-[11px] font-mono flex gap-3 rounded px-3 py-1.5 border ${r.passed?"bg-[#00f2ff]/5 border-[#00f2ff]/20 text-cyan-400":"bg-[#ff007a]/5 border-[#ff007a]/20 text-[#ff007a]"}`}>
                    <span className="shrink-0">{r.passed?"✓":"✗"} TEST_{i+1}</span>
                    <span className="text-gray-500 truncate flex-1">IN: {r.input.slice(0,28)}</span>
                    {!r.passed&&<span className="truncate text-white/80">OUT: {String(r.output).slice(0,22)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 bg-[#0a101f] flex items-center justify-between px-5 py-3 shrink-0 z-10">
            <div className="flex gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-black items-center">
              <span className="font-mono text-[#00f2ff]">MOD {qIdx+1}/{totalQs}</span>
              <span className="text-white/10">//</span>
              <span>Self <b className="text-[#00f2ff] text-sm ml-1">{myRoundScore}</b></span>
              <span className="text-white/10">//</span>
              <span>Hostile <b className="text-[#ff007a] text-sm ml-1">{aiRoundScore}</b></span>
              {language!=="javascript"&&submitting&&(
                <>
                  <span className="text-white/10 hidden md:inline">//</span>
                  <span className="text-blue-400 text-[9px] animate-pulse hidden md:inline">Compiling on remote node...</span>
                </>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting||iMeSolved(roundIdx,qIdx)}
              className={`px-8 py-2.5 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all ${
                iMeSolved(roundIdx,qIdx)
                  ?"bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] cursor-default"
                  :submitting
                  ?"bg-[#050b14] border border-white/10 text-gray-500 cursor-wait"
                  :"bg-gradient-to-r from-[#00f2ff] to-[#3b82f6] text-[#050b14] hover:brightness-125 active:scale-95 shadow-[0_0_15px_rgba(0,242,255,0.4)]"
              }`}>
              {iMeSolved(roundIdx,qIdx)?"Verified":submitting?(language==="javascript"?"Executing":"Compiling"):"Execute Sequence >>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}